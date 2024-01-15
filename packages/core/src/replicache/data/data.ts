import { eq, sql } from "drizzle-orm";
import type { PatchOperation, ReadonlyJSONObject } from "replicache";

import type { TableName, Transaction } from "@pachi/db";
import {
  jsonTable,
  replicacheClientGroups,
  replicacheClients,
} from "@pachi/db/schema";
import {
  spaceRecords,
  type ClientGroupObject,
  type ClientViewDataWithTable,
  type SpaceId,
  type SpaceRecords,
} from "@pachi/types";

import {
  deleteItems_,
  getClientViewDataWithTables,
  getFullItems,
  getLastMutationIDChanges,
  putItems_,
  updateItems_,
} from "../transaction-queries";
import { getClientLastMutationIdAndVersion_ } from "../transaction-queries/get-client-last-mutations-ids";

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
  spaceRecord: SpaceRecords[T] | undefined;
  subspaceIds?: (keyof SpaceRecords[T])[];
  userId: string | undefined;
  transaction: Transaction;
}): Promise<{ patch: PatchOperation[]; newSpaceRecord: SpaceRecords[T] }> => {
  if (!spaceRecord) {
    const result = await getResetPatch({
      spaceId,
      transaction,
      userId,
    });
    return result;
  }
  const newSpaceRecord = spaceRecord;
  const subspaceClientView: Record<
    keyof SpaceRecords[T],
    ClientViewDataWithTable
  > = {} as Record<keyof SpaceRecords[T], ClientViewDataWithTable>;

  const putKeys = new Map<TableName, string[]>();
  const delKeys = [];

  try {
    //if subspaceIds provided only retrieve subspace items, rather than the whole space items
    if (subspaceIds)
      await Promise.all(
        subspaceIds.map(async (subspaceId) => {
          const clientViewDataWithTable = await getClientViewDataWithTables({
            spaceId,
            subspaceId,
            transaction,
            userId,
          });
          subspaceClientView[subspaceId] = clientViewDataWithTable;
        }),
      );
    else
      await Promise.all(
        Object.keys(spaceRecord).map(async (value) => {
          const subspaceId = value as keyof SpaceRecords[T];
          const clientViewDataWithTable = await getClientViewDataWithTables({
            spaceId,
            subspaceId,
            transaction,
            userId,
          });
          subspaceClientView[subspaceId] = clientViewDataWithTable;
        }),
      );
    for (const [subspaceId_, clientViewDataWithTable_] of Object.entries(
      subspaceClientView,
    )) {
      const subspaceId = subspaceId_ as keyof SpaceRecords[T];
      const clientViewDataWithTable =
        clientViewDataWithTable_ as ClientViewDataWithTable;
      const cvd = makeClientViewData({
        items: clientViewDataWithTable,
      });

      for (const { cvd, tableName } of clientViewDataWithTable) {
        const keys = putKeys.get(tableName) ?? [];
        for (const { id, version } of cvd) {
          const prevVersion = (
            spaceRecord[subspaceId] as Record<string, number | undefined>
          )[id];
          if (prevVersion === undefined || prevVersion < version) {
            keys.push(id);
          }
        }
        putKeys.set(tableName, keys);
      }
      for (const key of Object.keys(
        spaceRecord[subspaceId] as Record<string, number>,
      )) {
        if (cvd[key] === undefined) {
          delKeys.push(key);
        }
      }
      newSpaceRecord[subspaceId] =
        cvd as (typeof spaceRecord)[typeof subspaceId];
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
  userId: string | undefined;
  transaction: Transaction;
}): Promise<{ patch: PatchOperation[]; newSpaceRecord: SpaceRecords[T] }> => {
  try {
    console.log("getting reset patch");
    const patch: PatchOperation[] = [
      {
        op: "clear",
      },
    ];
    const newSpaceRecord: SpaceRecords[T] = {} as SpaceRecords[T];
    const subspaceClientView: Record<
      keyof SpaceRecords[T],
      ClientViewDataWithTable
    > = {} as Record<keyof SpaceRecords[T], ClientViewDataWithTable>;
    const subspaces = Object.keys(
      spaceRecords[spaceId],
    ) as (keyof SpaceRecords[T])[];
    await Promise.all(
      subspaces.map(async (subspaceId) => {
        const clientViewDataWithTable = await getClientViewDataWithTables({
          spaceId,
          subspaceId,
          transaction,
          userId,
        });
        subspaceClientView[subspaceId] = clientViewDataWithTable;
      }),
    );
    for (const [subspaceId_, clientViewDataWithTable_] of Object.entries(
      subspaceClientView,
    )) {
      const subspaceId = subspaceId_ as keyof (typeof spaceRecords)[T];
      const clientViewDataWithTable =
        clientViewDataWithTable_ as ClientViewDataWithTable;
      const cvd = makeClientViewData({
        items: clientViewDataWithTable,
      });
      console.log("cvd", cvd);
      newSpaceRecord[subspaceId] =
        cvd as (typeof spaceRecords)[T][typeof subspaceId];

      for (const { cvd } of clientViewDataWithTable) {
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

  userId: string | undefined,
  transaction: Transaction,
) => {
  if (!userId) return;
  try {
    const queries = [];
    console.log("put items", props);
    for (const [tableName, items] of props.entries()) {
      queries.push(putItems_({ tableName, items, transaction }));
    }
    return await Promise.all(queries);
  } catch (error) {
    console.log(error);
    throw new Error("failed to put items");
  }
};
export const updateItems = async (
  props: Map<TableName, { id: string; value: ReadonlyJSONObject }[]>,
  userId: string | undefined,
  transaction: Transaction,
) => {
  if (!userId) return;
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
  return Promise.all(queries.flat());
};

export const deleteItems = async (
  props: Map<TableName, string[]>,
  userId: string | undefined,
  transaction: Transaction,
) => {
  if (!userId) return;
  const queries = [];
  try {
    for (const [tableName, keys] of props.entries()) {
      queries.push(deleteItems_({ tableName, keys, userId, transaction }));
    }
    console.log("delete queries", queries);
    return await Promise.all(queries);
  } catch (error) {
    console.log(error);
    throw new Error("failed to delete items");
  }
};
export const getPrevSpaceRecord = async ({
  key,
  transaction,
  spaceId,
}: {
  key: string | undefined;
  transaction: Transaction;
  spaceId: SpaceId;
}) => {
  if (!key) {
    return undefined;
  }

  try {
    const spaceRecord = await transaction.query.jsonTable.findFirst({
      where: (json, { eq }) => eq(json.id, key),
    });
    if (spaceRecord) return spaceRecord.value as SpaceRecords[typeof spaceId];

    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get prev clientViewData");
  }
};

export const getClientGroupObject = async ({
  clientGroupID,
  transaction,
}: {
  clientGroupID: string;
  transaction: Transaction;
}): Promise<ClientGroupObject> => {
  try {
    const clientViewData =
      await transaction.query.replicacheClientGroups.findFirst({
        where: (clientGroup, { eq }) => eq(clientGroup.id, clientGroupID),
      });

    if (clientViewData) return clientViewData;
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
  transaction,
  clientGroupObject,
}: {
  transaction: Transaction;
  clientGroupObject: ClientGroupObject;
}) => {
  try {
    return await transaction.insert(replicacheClientGroups).values({
      id: clientGroupObject.id,
      spaceRecordVersion: clientGroupObject.spaceRecordVersion,
      clientVersion: clientGroupObject.clientVersion,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to put clientGroupObject");
  }
};

export const setSpaceRecord = async <T extends SpaceId>({
  key,
  spaceRecord,
  transaction,
}: {
  key: string;
  spaceRecord: SpaceRecords[T];
  transaction: Transaction;
}) => {
  try {
    await transaction.insert(jsonTable).values({
      id: key,
      value: spaceRecord,
    });
  } catch (error) {
    console.log(error);
    throw new Error("failed to set clientViewData");
  }
};

export const deleteSpaceRecord = async ({
  key,
  transaction,
}: {
  key: string | undefined;
  transaction: Transaction;
}) => {
  if (!key) return;
  try {
    return await transaction.delete(jsonTable).where(eq(jsonTable.id, key));
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
    const setLastMutationIdsAndVersionsPrepared = transaction
      .insert(replicacheClients)
      .values({
        id: sql.placeholder("id"),
        lastMutationID: sql.placeholder("lastMutationID"),
        version: 1,
        clientGroupID: sql.placeholder("clientGroupID"),
      })
      .onConflictDoUpdate({
        target: replicacheClients.id,
        set: {
          //@ts-ignore
          version: sql.placeholder("version"),
          //@ts-ignore
          lastMutationID: sql.placeholder("lastMutationID"),
        },
      })
      .prepare("lm");

    const executionPromises = Object.entries(lastMutationIdsAndVersions).map(
      ([key, { lastMutationID, version }]) =>
        setLastMutationIdsAndVersionsPrepared.execute({
          key,
          lastMutationID,
          version,
          clientGroupID,
        }),
    );
    return Promise.all(executionPromises);
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
