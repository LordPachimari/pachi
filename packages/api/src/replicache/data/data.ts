import type { PatchOperation, ReadonlyJSONObject } from "replicache";

import type { TableName, Transaction } from "@pachi/db";
import {
  SubspacesIds,
  type ClientGroupObject,
  type ClientViewDataWithTable,
  type SpaceId,
  type SpaceRecord,
  type SubspaceIds,
} from "@pachi/types";

import {
  deleteItems_,
  getClientViewDataWithTables,
  getFullItems,
  getLastMutationIDChanges,
  putItems_,
  setLastMutationIdsAndVersions_,
  updateItems_,
} from "../transaction-queries/common";
import { getClientLastMutationIdAndVersion_ } from "../transaction-queries/common/get-client-last-mutations-ids";

const year = 31622400;

export const makeClientViewData = ({
  items,
}: {
  items: {
    cvd: {
      id: string;
      version: number;
    }[];
  }[];
}): Record<string, number> => {
  const clientViewData: Record<string, number> = {};
  for (const { cvd } of items) {
    for (const item of cvd) {
      clientViewData[item.id] = item.version;
    }
  }
  return clientViewData;
};

export const getPatch = async <T extends SpaceId>({
  spaceId,
  spaceRecord,
  userId,
  subspaceIds,
  transaction,
}: {
  spaceId: T;
  spaceRecord: SpaceRecord<T>;
  subspaceIds?: SubspaceIds<T>[];
  userId: string;
  transaction: Transaction;
}): Promise<{ patch: PatchOperation[]; newSpaceRecord: SpaceRecord<T> }> => {
  if (!spaceRecord) {
    const result = await getResetPatch({
      spaceId,
      transaction,
      userId,
    });
    return result;
  }
  const newSpaceRecord = spaceRecord;
  const clientViewDataWithTable: Record<
    SubspaceIds<T>,
    ClientViewDataWithTable
  > = {} as Record<SubspaceIds<T>, ClientViewDataWithTable>;

  const putKeys = new Map<TableName, string[]>();
  const delKeys = [];

  try {
    //if subspaceIds provided only retrieve subspace items, rather than the whole space items
    if (subspaceIds)
      await Promise.all(
        subspaceIds.map(async (subspaceId) => {
          const clientViewData = await getClientViewDataWithTables({
            spaceId,
            subspaceId,
            transaction,
            userId,
          });
          clientViewDataWithTable[subspaceId] = clientViewData;
        }),
      );
    else
      await Promise.all(
        Object.keys(spaceRecord).map(async (value) => {
          const subspaceId = value as SubspaceIds<T>;
          const clientViewData = await getClientViewDataWithTables({
            spaceId,
            subspaceId,
            transaction,
            userId,
          });
          clientViewDataWithTable[subspaceId] = clientViewData;
        }),
      );
    for (const [subspaceId_, clientViewData_] of Object.entries(
      clientViewDataWithTable,
    )) {
      const subspaceId = subspaceId_ as SubspaceIds<T>;
      const clientViewData = clientViewData_ as ClientViewDataWithTable;
      const cvd = makeClientViewData({
        items: clientViewData,
      });

      for (const { cvd, tableName } of clientViewData) {
        const keys = putKeys.get(tableName) ?? [];
        for (const { id, version } of cvd) {
          //@ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const prevVersion = spaceRecord[subspaceId][id] as number | undefined;
          if (prevVersion === undefined || prevVersion < version) {
            keys.push(id);
          }
        }
        putKeys.set(tableName, keys);
      }
      for (const key of Object.keys(
        //@ts-ignore
        spaceRecord[subspaceId] as Record<string, number>,
      )) {
        if (cvd[key] === undefined) {
          delKeys.push(key);
        }
      }
      //@ts-ignore
      newSpaceRecord[subspaceId] = cvd;
    }

    const fullItemsPromises: Promise<Record<string, unknown>[]>[] = [];
    for (const [tableName, keys] of putKeys.entries()) {
      fullItemsPromises.push(getFullItems({ tableName, keys, transaction }));
    }
    const fullItems = (await Promise.all(fullItemsPromises)).flat();

    const patch: PatchOperation[] = [];
    for (const key of delKeys) {
      patch.push({
        op: "del",
        key,
      });
    }
    for (const item of fullItems) {
      if (item)
        patch.push({
          op: "put",
          key: item["id"] as string,
          value: item as ReadonlyJSONObject,
        });
    }

    return { patch, newSpaceRecord };
  } catch (error) {
    console.log(error);
    throw new Error("failed to get changed entries");
  }
};

const getResetPatch = async <T extends SpaceId>({
  spaceId,
  transaction,
  userId,
}: {
  spaceId: T;
  userId: string;
  transaction: Transaction;
}): Promise<{ patch: PatchOperation[]; newSpaceRecord: SpaceRecord<T> }> => {
  try {
    console.log("getting reset patch");
    const patch: PatchOperation[] = [
      {
        op: "clear",
      },
    ];
    const newSpaceRecord: SpaceRecord<T> = {} as SpaceRecord<T>;
    const clientViewDataWithTable: Record<
      SubspaceIds<T>,
      ClientViewDataWithTable
    > = {} as Record<SubspaceIds<T>, ClientViewDataWithTable>;
    const subspaces = SubspacesIds[spaceId];
    console.log("subspaces", subspaces);
    await Promise.all(
      subspaces.map(async (value) => {
        const subspaceId = value as SubspaceIds<T>;
        const clientViewData = await getClientViewDataWithTables({
          spaceId,
          subspaceId,
          transaction,
          userId,
        });
        clientViewDataWithTable[subspaceId] = clientViewData;
      }),
    );
    for (const [subspaceId_, clientViewData_] of Object.entries(
      clientViewDataWithTable,
    )) {
      const subspaceId = subspaceId_ as SubspaceIds<T>;
      const clientViewData = clientViewData_ as ClientViewDataWithTable;
      const cvd = makeClientViewData({
        items: clientViewData,
      });
      console.log("cvd", cvd);
      //@ts-ignore
      newSpaceRecord[subspaceId] = cvd;

      for (const { cvd } of clientViewData) {
        for (const item of cvd) {
          patch.push({
            op: "put",
            key: item.id,
            value: item as ReadonlyJSONObject,
          });
        }
      }
    }

    return { patch, newSpaceRecord };
  } catch (error) {
    console.log(error);
    throw new Error("failed to get reset patch");
  }
};

export const putItems = async (
  props: Map<TableName, { id: string; value: ReadonlyJSONObject }[]>,
  transaction: Transaction,
) => {
  try {
    const queries = [];
    console.log("put items", props);
    for (const [tableName, items] of props.entries()) {
      queries.push(putItems_({ tableName, items, transaction }));
    }
    return await Promise.all(queries);
  } catch (error) {
    console.log(error, "WATCHOUT", JSON.stringify(props));
    throw new Error("failed to put items");
  }
};
export const updateItems = async (
  props: Map<TableName, { id: string; value: ReadonlyJSONObject }[]>,
  userId: string,
  transaction: Transaction,
) => {
  try {
    console.log("updating items", JSON.stringify(props.entries()));
    const queries = [];
    for (const [tableName, values] of props.entries()) {
      queries.push(
        updateItems_({
          tableName,
          items: values,
          userId,
          transaction,
        }),
      );
    }
    console.log("update queries");
    return await Promise.all(queries.flat());
  } catch (error) {
    console.log(error, "WATCHOUT", JSON.stringify(props));
    throw new Error("failed to update items");
  }
};

export const deleteItems = async (
  props: Map<TableName, string[]>,
  userId: string,
  transaction: Transaction,
) => {
  const queries = [];
  try {
    for (const [tableName, keys] of props.entries()) {
      queries.push(deleteItems_({ tableName, keys, userId, transaction }));
    }
    console.log("delete queries", queries);
    return await Promise.all(queries);
  } catch (error) {
    console.log(error);
    throw new Error("failed to update items");
  }
};
export const getPrevSpaceRecord = async ({
  key,
  storage,
}: {
  key: string | undefined;
  storage: KVNamespace;
}) => {
  if (!key) {
    return undefined;
  }

  try {
    const spaceRecord = await storage.get(key);
    if (spaceRecord) return JSON.parse(spaceRecord) as SpaceRecord<SpaceId>;

    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get prev clientViewData");
  }
};

export const getClientGroupObject = async ({
  clientGroupID,
  storage,
}: {
  clientGroupID: string;
  storage: KVNamespace;
}): Promise<ClientGroupObject> => {
  try {
    const clientViewData = await storage.get(clientGroupID);
    if (clientViewData) return JSON.parse(clientViewData) as ClientGroupObject;
    else
      return {
        id: clientGroupID,
        spaceRecordVersion: 0,
        clientVersion: 0,
      };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get clientGroupObject");
  }
};

export const setClientGroupObject = async ({
  clientGroupID,
  storage,
  clientGroupObject,
}: {
  clientGroupID: string;
  storage: KVNamespace;
  clientGroupObject: ClientGroupObject;
}) => {
  try {
    return await storage.put(clientGroupID, JSON.stringify(clientGroupObject));
  } catch (error) {
    console.log(error);
    throw new Error("Failed to put clientGroupObject");
  }
};

export const setSpaceRecord = async ({
  key,
  spaceRecord,
  storage,
}: {
  key: string;
  spaceRecord: SpaceRecord<SpaceId>;
  storage: KVNamespace;
}) => {
  try {
    await storage.put(key, JSON.stringify(spaceRecord));
  } catch (error) {
    console.log(error);
    throw new Error("failed to set clientViewData");
  }
};

export const deleteSpaceRecord = async ({
  key,
  storage,
}: {
  key: string | undefined;
  storage: KVNamespace;
}) => {
  if (!key) return;
  try {
    return await storage.delete(key);
  } catch (error) {
    console.log(error);
    throw new Error("failed to delete clientViewRecord");
  }
};
export const setLastMutationIdsAndVersions = async ({
  clientGroupID,
  lastMutationIdsAndVersions,
  transaction,
}: {
  clientGroupID: string;
  lastMutationIdsAndVersions: Record<
    string,
    { lastMutationID: number; version: number }
  >;
  transaction: Transaction;
}) => {
  try {
    await Promise.all(
      setLastMutationIdsAndVersions_({
        lastMutationIdsAndVersions,
        clientGroupID,
        transaction,
      }),
    );
  } catch (error) {
    console.log(error);
    throw new Error("Transact update lastMutationIds failed");
  }
};
export const getLastMutationIdsSince = async ({
  clientGroupID,
  clientVersion,
  transaction,
}: {
  clientGroupID: string;
  clientVersion: number;
  transaction: Transaction;
}): Promise<{
  lastMutationIDChanges: Record<string, number>;
}> => {
  try {
    if (clientVersion === 0) {
      return {
        lastMutationIDChanges: {},
      };
    }
    const lastMutationIDChanges = await getLastMutationIDChanges({
      clientGroupID,
      clientVersion,
      transaction,
    });

    return {
      lastMutationIDChanges,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get client IDS that changed");
  }
};
export const getClientLastMutationIdsAndVersion = async ({
  clientIDs,
  clientGroupID,
  transaction,
}: {
  clientIDs: string[];
  clientGroupID: string;
  transaction: Transaction;
}) => {
  try {
    const result = await getClientLastMutationIdAndVersion_({
      clientGroupID,
      clientIDs,
      transaction,
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get client IDS");
  }
};
