import { eq, sql } from "drizzle-orm";
import { Context, Effect } from "effect";
import { isDefined } from "remeda";
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
  type PermissionDenied,
  type SpaceId,
  type SpaceRecords,
} from "@pachi/types";
import { withDieErrorLogger } from "@pachi/utils";

import {
  deleteItems_,
  getClientViewDataWithTables,
  getFullItems,
  getLastMutationIDChanges,
  setItems_,
  updateItems_,
} from "../transaction-queries";
import { getClientLastMutationIdAndVersion_ } from "../transaction-queries/get-client-last-mutations-ids";

export const makeClientViewData = (
  data: Array<ClientViewDataWithTable>,
): Record<string, number> => {
  const clientViewData: Record<string, number> = {};
  for (const { cvd } of data) {
    for (const item of cvd) {
      clientViewData[item.id] = item.version;
    }
  }
  return clientViewData;
};
export const getPatch = <T extends SpaceId>({
  spaceId,
  spaceRecord,
  userId,
  subspaceIds,
  transaction,
}: {
  spaceId: T;
  spaceRecord: SpaceRecords[T] | undefined;
  subspaceIds: (keyof SpaceRecords[T])[] | undefined;
  userId: string | undefined;
  transaction: Transaction;
}): Effect.Effect<
  { patch: PatchOperation[]; newSpaceRecord: SpaceRecords[T] },
  never,
  never
> => {
  if (!spaceRecord) {
    const result = getResetPatch({
      spaceId,
      transaction,
      userId,
    });
    return result;
  }
  return Effect.gen(function* (_) {
    const newSpaceRecord = spaceRecord;
    const setKeys = new Map<TableName, string[]>();
    const delKeys: string[] = [];
    const subspaces = subspaceIds
      ? subspaceIds
      : (Object.keys(spaceRecord) as (keyof SpaceRecords[T])[]);
    const subspaceClientView = yield* _(
      Effect.forEach(
        subspaces,
        (subspaceId) => {
          return Effect.gen(function* (_) {
            const clientViewDataWithTable = yield* _(
              getClientViewDataWithTables({
                spaceId,
                subspaceId,
                transaction,
                ...(userId && { userId }),
                isFullItems: false,
              }).pipe(
                Effect.orDieWith((e) =>
                  withDieErrorLogger(e, "location: data getPatch"),
                ),
              ),
            );
            return {
              subspaceId,
              clientViewDataWithTable,
            };
          });
        },
        {
          concurrency: "unbounded",
        },
      ),
    );
    yield* _(
      Effect.forEach(
        subspaceClientView,
        ({ subspaceId, clientViewDataWithTable }) => {
          return Effect.sync(() => {
            const cvd = makeClientViewData(clientViewDataWithTable);
            newSpaceRecord[subspaceId] =
              cvd as SpaceRecords[T][typeof subspaceId];
            for (const { cvd, tableName } of clientViewDataWithTable) {
              const keys = setKeys.get(tableName) ?? [];
              for (const { id, version } of cvd) {
                const prevVersion = (
                  spaceRecord[subspaceId] as Record<string, number>
                )[id];
                if (!isDefined(prevVersion) || prevVersion < version) {
                  keys.push(id);
                }
              }
              setKeys.set(tableName, keys);
            }
            for (const key of Object.keys(
              spaceRecord[subspaceId] as Record<string, number>,
            )) {
              if (cvd[key] === undefined) {
                delKeys.push(key);
              }
            }
          });
        },
        {
          concurrency: "unbounded",
        },
      ),
    );

    const fullItems = yield* _(
      Effect.forEach(
        setKeys.entries(),
        ([tableName, keys]) => {
          return Effect.gen(function* (_) {
            const fullItems = yield* _(
              getFullItems({ tableName, keys, transaction }),
            );
            return fullItems;
          });
        },
        { concurrency: "unbounded" },
      ),
    );

    const patch: PatchOperation[] = [];
    for (const key of delKeys) {
      patch.push({
        op: "del",
        key,
      });
    }
    for (const item of fullItems.flat()) {
      if (item)
        patch.push({
          op: "put",
          key: (item as { id: string }).id,
          value: item as ReadonlyJSONObject,
        });
    }

    return { patch, newSpaceRecord };
  });
};

const getResetPatch = <T extends SpaceId>({
  spaceId,
  transaction,
  userId,
}: {
  spaceId: T;
  userId: string | undefined;
  transaction: Transaction;
}): Effect.Effect<
  { patch: PatchOperation[]; newSpaceRecord: SpaceRecords[T] },
  never,
  never
> =>
  Effect.gen(function* (_) {
    const patch: PatchOperation[] = [
      {
        op: "clear" as const,
      },
    ];
    const newSpaceRecord: SpaceRecords[T] = {} as SpaceRecords[T];
    const subspaces = Object.keys(
      spaceRecords[spaceId],
    ) as (keyof SpaceRecords[T])[];
    const subspaceClientView = yield* _(
      Effect.forEach(
        subspaces,
        (subspaceId) => {
          return Effect.gen(function* (_) {
            const clientViewDataWithTable = yield* _(
              getClientViewDataWithTables({
                spaceId,
                subspaceId,
                transaction,
                ...(userId && { userId }),
                isFullItems: true,
              }).pipe(
                Effect.orDieWith((e) =>
                  withDieErrorLogger(e, "location: data getPatch"),
                ),
              ),
            );
            return {
              subspaceId,
              clientViewDataWithTable,
            };
          });
        },
        {
          concurrency: "unbounded",
        },
      ),
    );
    yield* _(
      Effect.forEach(
        subspaceClientView,
        ({ subspaceId, clientViewDataWithTable }) => {
          return Effect.sync(() => {
            const cvd = makeClientViewData(clientViewDataWithTable);
            newSpaceRecord[subspaceId] =
              cvd as SpaceRecords[T][typeof subspaceId];
            for (const { cvd } of clientViewDataWithTable) {
              for (const item of cvd) {
                patch.push({
                  op: "put",
                  key: item.id,
                  value: item as ReadonlyJSONObject,
                });
              }
            }
          });
        },
        {
          concurrency: "unbounded",
        },
      ),
    );

    return { patch, newSpaceRecord };
  });

export const setItems = (
  props: Map<TableName, { id: string; value: ReadonlyJSONObject }[]>,

  userId: string | undefined,
  transaction: Transaction,
): Effect.Effect<void, never, never> => {
  return Effect.gen(function* (_) {
    if (!userId) return;
    yield* _(
      Effect.forEach(
        props.entries(),
        ([tableName, items]) => {
          return setItems_({ tableName, items, transaction });
        },
        {
          concurrency: "unbounded",
        },
      ),
    );
  });
};

export const updateItems = (
  props: Map<TableName, { id: string; value: ReadonlyJSONObject }[]>,
  userId: string | undefined,
  transaction: Transaction,
): Effect.Effect<void, PermissionDenied, never> =>
  Effect.gen(function* (_) {
    if (!userId) return;
    const effects: Array<Effect.Effect<void, PermissionDenied, never>> = [];
    for (const [tableName, items] of props.entries()) {
      effects.push(updateItems_({ tableName, items, userId, transaction }));
    }
    yield* _(Effect.all(effects, { concurrency: "unbounded" }));
  });

export const deleteItems = (
  props: Map<TableName, string[]>,
  userId: string | undefined,
  transaction: Transaction,
): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
    if (!userId) return;
    const effects: Array<Effect.Effect<void, never, never>> = [];
    for (const [tableName, keys] of props.entries()) {
      effects.push(deleteItems_({ tableName, keys, userId, transaction }));
    }
    yield* _(Effect.all(effects, { concurrency: "unbounded" }));
  });

export const getPrevSpaceRecord = <T extends SpaceId>({
  key,
  transaction,
}: {
  key: string | undefined;
  transaction: Transaction;
  spaceId: T;
}): Effect.Effect<SpaceRecords[T] | undefined, never, never> =>
  Effect.gen(function* (_) {
    if (!key) {
      return undefined;
    }
    const spaceRecord = yield* _(
      Effect.tryPromise(() =>
        transaction.query.jsonTable.findFirst({
          where: (json, { eq }) => eq(json.id, key),
        }),
      ).pipe(
        Effect.orDieWith((e) =>
          withDieErrorLogger(e, "getPrevSpaceRecord error"),
        ),
      ),
    );
    if (spaceRecord?.value) return spaceRecord.value as SpaceRecords[T];
    return undefined;
  });

export const getClientGroupObject = ({
  clientGroupID,
  transaction,
}: {
  clientGroupID: string;
  transaction: Transaction;
}): Effect.Effect<ClientGroupObject, never, never> =>
  Effect.gen(function* (_) {
    const clientViewData = yield* _(
      Effect.tryPromise(() =>
        transaction.query.replicacheClientGroups.findFirst({
          where: (clientGroup, { eq }) => eq(clientGroup.id, clientGroupID),
        }),
      ).pipe(
        Effect.orDieWith((e) =>
          withDieErrorLogger(e, "getClientGroupObject error"),
        ),
      ),
    );

    if (clientViewData) return clientViewData;
    else
      return {
        id: clientGroupID,
        spaceRecordVersion: 0,
        clientVersion: 0,
      };
  });

export const setClientGroupObject = ({
  transaction,
  clientGroupObject,
}: {
  transaction: Transaction;
  clientGroupObject: ClientGroupObject;
}): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
    yield* _(
      Effect.tryPromise(() =>
        transaction.insert(replicacheClientGroups).values({
          id: clientGroupObject.id,
          spaceRecordVersion: clientGroupObject.spaceRecordVersion,
          clientVersion: clientGroupObject.clientVersion,
        }),
      ).pipe(
        Effect.orDieWith((e) =>
          withDieErrorLogger(e, "setClientGroupObject error"),
        ),
      ),
    );
  });

export const setSpaceRecord = <T extends SpaceId>({
  key,
  spaceRecord,
  transaction,
}: {
  key: string;
  spaceRecord: SpaceRecords[T];
  transaction: Transaction;
}): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
    yield* _(
      Effect.tryPromise(() =>
        transaction.insert(jsonTable).values({
          id: key,
          value: spaceRecord,
        }),
      ).pipe(
        Effect.orDieWith((e) => withDieErrorLogger(e, "setSpaceRecord error")),
      ),
    );
  });

export const deleteSpaceRecord = ({
  key,
  transaction,
}: {
  key: string | undefined;
  transaction: Transaction;
}): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
    if (!key) return;
    yield* _(
      Effect.tryPromise(() =>
        transaction.delete(jsonTable).where(eq(jsonTable.id, key)),
      ).pipe(
        Effect.orDieWith((e) =>
          withDieErrorLogger(e, "delete space record error"),
        ),
      ),
    );
  });
export const setLastMutationIdsAndVersions = ({
  clientGroupID,
  lastMutationIdsAndVersions,
  transaction,
}: {
  clientGroupID: string;
  lastMutationIdsAndVersions: Map<
    string,
    { lastMutationID: number; version: number }
  >;
  transaction: Transaction;
}): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
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
    const executionEffects = Array.from(lastMutationIdsAndVersions).map(
      ([key, { lastMutationID, version }]) =>
        Effect.tryPromise(() =>
          setLastMutationIdsAndVersionsPrepared.execute({
            key,
            lastMutationID,
            version,
            clientGroupID,
          }),
        ).pipe(
          Effect.orDieWith((e) =>
            withDieErrorLogger(e, "setLastMutationIdsAndVersions error"),
          ),
        ),
    );

    yield* _(Effect.all(executionEffects, { concurrency: "unbounded" }));
  });

export const getLastMutationIdsSince = ({
  clientGroupID,
  clientVersion,
  transaction,
}: {
  clientGroupID: string;
  clientVersion: number;
  transaction: Transaction;
}): Effect.Effect<
  { lastMutationIDChanges: Record<string, number> },
  never,
  never
> =>
  Effect.gen(function* (_) {
    if (clientVersion === 0) {
      return {
        lastMutationIDChanges: {},
      };
    }
    const lastMutationIDChanges = yield* _(
      getLastMutationIDChanges({
        clientGroupID,
        clientVersion,
        transaction,
      }),
    );

    return {
      lastMutationIDChanges,
    };
  });
export const getClientLastMutationIdsAndVersion = ({
  clientIDs,
  clientGroupID,
  transaction,
}: {
  clientIDs: string[];
  clientGroupID: string;
  transaction: Transaction;
}): Effect.Effect<
  Map<string, { lastMutationID: number; version: number }>,
  never,
  never
> =>
  Effect.gen(function* (_) {
    const result = yield* _(
      getClientLastMutationIdAndVersion_({
        clientGroupID,
        clientIDs,
        transaction,
      }),
    );
    return result;
  });
