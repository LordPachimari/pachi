import { eq, inArray } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { isDefined, keys, mapToObj } from "remeda";
import type { PatchOperation, ReadonlyJSONObject } from "replicache";

import {
  tableNameToTableMap,
  type TableName,
  type Transaction,
} from "@pachi/db";
import {
  replicacheClientGroups,
  replicacheClients,
  replicacheSubspaceRecords,
} from "@pachi/db/schema";
import {
  ulid,
  UnknownExceptionLogger,
  type ExtractEffectValue,
} from "@pachi/utils";
import {
  InvalidValue,
  SPACE_RECORD,
  type ClientGroupObject,
  type ClientViewRecord,
  type RowsWTableName,
  type SpaceID,
  type SpaceRecord,
} from "@pachi/validators";

import type {
  ClientRecordDiff,
  ReplicacheRecordManagerBase,
  SpaceRecordDiff,
  SubspaceRecord,
} from "./manager";
import { SpaceRecordGetter } from "./space-record/getter";

export const makeClientViewRecord = (
  data: RowsWTableName[],
): Record<string, number> => {
  const clientViewRecord: Record<string, number> = {};

  for (const { rows } of data) {
    for (const row of rows) {
      clientViewRecord[row.id] = row.version;
    }
  }

  return clientViewRecord;
};

export const getRowsWTableName = <T extends SpaceID>({
  userID,
  spaceID,
  subspaceID,
  transaction,
  fullRows,
}: {
  spaceID: T;
  userID: string | undefined;
  subspaceID: SpaceRecord[T][number];
  transaction: Transaction;
  fullRows: boolean;
}): Effect.Effect<RowsWTableName[], InvalidValue, never> => {
  const getRowsWTableName = SpaceRecordGetter[spaceID][subspaceID];

  if (getRowsWTableName) {
    return getRowsWTableName({
      transaction,
      userID,
      fullRows,
    });
  }

  return Effect.fail(
    new InvalidValue({
      message: "Invalid spaceID or subspaceID",
    }),
  );
};

const getPrevSpaceRecord = <T extends SpaceID>({
  key,
  spaceID,
  transaction,
  subspaceIDs,
}: {
  key: string | undefined;
  spaceID: T;
  transaction: Transaction;
  subspaceIDs: Array<SpaceRecord[T][number]>;
}): ReturnType<ReplicacheRecordManagerBase["getPrevSpaceRecord"]> => {
  return Effect.gen(function* (_) {
    if (!key) return undefined;
    const subIDs = subspaceIDs.length > 0 ? subspaceIDs : SPACE_RECORD[spaceID];

    return yield* _(
      pipe(
        Effect.tryPromise(() =>
          transaction.query.replicacheSubspaceRecords.findMany({
            columns: {
              id: true,
              subspaceID: true,
              record: true,
            },
            where: ({ subspaceID, id }, { inArray, eq, and }) =>
              and(eq(id, key), inArray(subspaceID, subIDs)),
          }),
        ),
        Effect.orDieWith((e) =>
          UnknownExceptionLogger(e, "GET PREVIOUS SPACE RECORD ERROR"),
        ),
      ),
    );
  });
};

const getCurrentSpaceRecord = <T extends SpaceID>({
  spaceID,
  transaction,
  subspaceIDs,
  userID,
}: {
  spaceID: T;
  transaction: Transaction;
  subspaceIDs: Array<SpaceRecord[T][number]>;
  userID: string | undefined;
}): ReturnType<ReplicacheRecordManagerBase["getCurrentSpaceRecord"]> => {
  return Effect.gen(function* (_) {
    const subIDs = subspaceIDs ?? SPACE_RECORD[spaceID];

    return yield* _(
      Effect.forEach(
        subIDs,
        (subspaceID) =>
          pipe(
            getRowsWTableName({
              spaceID,
              subspaceID,
              transaction,
              userID,
              fullRows: false,
            }),
            Effect.map((rows) => ({
              rows,
              subspaceRecord: {
                id: ulid(),
                subspaceID,
                record: makeClientViewRecord(rows),
              },
            })),
            Effect.orDie,
          ),

        {
          concurrency: "unbounded",
        },
      ),
      Effect.orDie,
    );
  });
};

const diffSpaceRecords = ({
  currentRecord,
  prevRecord,
}: {
  prevRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordManagerBase["getPrevSpaceRecord"]>
  >;
  currentRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordManagerBase["getCurrentSpaceRecord"]>
  >;
}): ReturnType<ReplicacheRecordManagerBase["diffSpaceRecords"]> => {
  return Effect.gen(function* (_) {
    const diff: SpaceRecordDiff = {
      deletedIDs: new Map(),
      newIDs: new Map(),
    };

    if (!prevRecord) {
      return diff;
    }

    const prevSpaceRecordObj = mapToObj(prevRecord, (data) => [
      data.subspaceID,
      data.record,
    ]);

    yield* _(
      Effect.forEach(
        currentRecord,
        ({ rows, subspaceRecord }) => {
          return Effect.sync(() => {
            const prevClientViewRecord =
              prevSpaceRecordObj[subspaceRecord.subspaceID] ?? {};

            rows.forEach(({ rows, tableName }) => {
              const newIDs = diff.newIDs.get(tableName) ?? new Set();
              const deletedIDs = diff.deletedIDs.get(tableName) ?? new Set();

              const addNewIDs = Effect.forEach(
                rows,
                ({ id, version }) =>
                  Effect.sync(() => {
                    const prevVersion = prevClientViewRecord[id];

                    if (!isDefined(prevVersion) || prevVersion < version) {
                      newIDs.add(id);
                    }
                  }),
                { concurrency: "unbounded" },
              );

              const addDeletedIDs = Effect.forEach(
                keys(prevClientViewRecord),
                (id) =>
                  Effect.sync(() => {
                    if (!isDefined(subspaceRecord.record[id])) {
                      deletedIDs.add(id);
                    }
                  }),
                { concurrency: "unbounded" },
              );

              Effect.all([addNewIDs, addDeletedIDs], {
                concurrency: "unbounded",
              });

              diff.deletedIDs.set(tableName, deletedIDs);
              diff.newIDs.set(tableName, newIDs);
            });
          });
        },
        { concurrency: "unbounded" },
      ),
    );

    return diff;
  });
};

const getPrevClientRecord = ({
  key,
  transaction,
}: {
  key: string | undefined;
  transaction: Transaction;
}): ReturnType<ReplicacheRecordManagerBase["getPrevClientRecord"]> =>
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
          UnknownExceptionLogger(e, "GET PREVIOUS CLIENT RECORD ERROR"),
        ),
      ),
    );

    if (spaceRecord?.value) return spaceRecord.value as ClientViewRecord;

    return undefined;
  });

const getCurrentClientRecord = ({
  transaction,
  clientGroupID,
}: {
  transaction: Transaction;
  clientGroupID: string;
}): ReturnType<ReplicacheRecordManagerBase["getCurrentClientRecord"]> =>
  pipe(
    Effect.tryPromise(() =>
      transaction
        .select({
          id: replicacheClients.id,
          lastMutationID: replicacheClients.lastMutationID,
        })
        .from(replicacheClients)
        .where(eq(replicacheClients.clientGroupID, clientGroupID)),
    ),
    Effect.orDieWith((e) =>
      UnknownExceptionLogger(e, "GET CURRENT CLIENT RECORD ERROR"),
    ),
  );

const diffClientRecords = ({
  currentRecord,
  prevRecord,
}: {
  prevRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordManagerBase["getPrevClientRecord"]>
  >;
  currentRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordManagerBase["getCurrentClientRecord"]>
  >;
}): ReturnType<ReplicacheRecordManagerBase["diffClientRecords"]> => {
  return Effect.gen(function* (_) {
    const diff: ClientRecordDiff = {};

    if (!prevRecord) return diff;

    yield* _(
      Effect.forEach(
        currentRecord,
        ({ id, lastMutationID }) => {
          return Effect.sync(() => {
            if (
              !isDefined(prevRecord[id]) ||
              (prevRecord[id] ?? -1) < lastMutationID
            ) {
              diff[id] = lastMutationID;
            }
          });
        },
        { concurrency: "unbounded" },
      ),
    );

    return diff;
  });
};

const createSpacePatch = ({
  diff,
  transaction,
}: {
  diff: SpaceRecordDiff;
  transaction: Transaction;
}): ReturnType<ReplicacheRecordManagerBase["createSpacePatch"]> => {
  return Effect.gen(function* (_) {
    const patch: PatchOperation[] = [];
    const fullRows = yield* _(
      Effect.forEach(
        diff.newIDs.entries(),
        ([tableName, ids]) =>
          getFullRows({
            keys: Array.from(ids),
            tableName,
            transaction,
          }),
        { concurrency: "unbounded" },
      ).pipe(Effect.map((fullRows) => fullRows.flat())),
    );

    const deletePatchEffect = Effect.forEach(
      diff.deletedIDs.values(),
      (ids) => {
        return Effect.forEach(ids, (id) => {
          return Effect.sync(() => {
            patch.push({
              op: "del",
              key: id,
            });
          });
        });
      },
      { concurrency: "unbounded" },
    );
    const putPatchEffect = Effect.forEach(
      fullRows,
      (item) => {
        return Effect.sync(() => {
          if (item) {
            patch.push({
              op: "put",
              key: (item as { id: string }).id,
              value: item as ReadonlyJSONObject,
            });
          }
        });
      },
      { concurrency: "unbounded" },
    );

    yield* _(
      Effect.all([deletePatchEffect, putPatchEffect], {
        concurrency: "unbounded",
      }),
    );

    return patch;
  });
};

const createSpaceResetPatch = <T extends SpaceID>({
  spaceID,
  transaction,
  userID,
}: {
  spaceID: T;
  userID: string | undefined;
  transaction: Transaction;
}): ReturnType<ReplicacheRecordManagerBase["createSpaceResetPatch"]> =>
  Effect.gen(function* (_) {
    const patch: PatchOperation[] = [
      {
        op: "clear" as const,
      },
    ];
    const subspaceIDs = SPACE_RECORD[spaceID];

    yield* _(
      Effect.forEach(
        subspaceIDs,
        (subspaceID) =>
          pipe(
            getRowsWTableName({
              spaceID,
              subspaceID,
              transaction,
              userID,
              fullRows: true,
            }),
            Effect.map((data) =>
              Effect.forEach(
                data,
                ({ rows }) =>
                  Effect.sync(() =>
                    Effect.forEach(
                      rows,
                      (item) =>
                        Effect.sync(() =>
                          patch.push({
                            op: "put",
                            key: item.id,
                            value: item as ReadonlyJSONObject,
                          }),
                        ),
                      { concurrency: "unbounded" },
                    ),
                  ),
                { concurrency: "unbounded" },
              ),
            ),
            Effect.orDie,
          ),
        {
          concurrency: "unbounded",
        },
      ),
    );

    return patch;
  });

const getFullRows = ({
  tableName,
  keys,
  transaction,
}: {
  tableName: TableName;
  keys: string[];
  transaction: Transaction;
}): Effect.Effect<Array<Record<string, unknown>>, never, never> => {
  if (keys.length === 0) {
    return Effect.succeed([]);
  }

  if (tableName === "users") {
    return pipe(
      Effect.tryPromise(() =>
        transaction.query.users.findMany({
          where: (user, { inArray }) => inArray(user.id, keys),
        }),
      ),
      Effect.orDieWith((e) =>
        UnknownExceptionLogger(e, "get full items error"),
      ),
    );
  } else if (tableName === "products") {
    return pipe(
      Effect.tryPromise(() =>
        transaction.query.products.findMany({
          where: (products, { inArray }) => inArray(products.id, keys),
          with: {
            variants: {
              with: {
                optionValues: {
                  with: {
                    value: {
                      with: {
                        option: true,
                      },
                    },
                  },
                },
              },
            },
            options: {
              with: {
                values: true,
              },
            },
            store: true,
          },
        }),
      ),
      Effect.orDieWith((e) => UnknownExceptionLogger(e, "GET FULL ROWS ERROR")),
    );
  } else {
    const table = tableNameToTableMap[tableName];

    return pipe(
      Effect.tryPromise(() =>
        transaction
          .select()
          .from(table)
          //@ts-ignore
          .where(inArray(table.id, keys)),
      ),
      Effect.orDieWith((e) => UnknownExceptionLogger(e, "GET FULL ROWS ERROR")),
    );
  }
};

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
          UnknownExceptionLogger(e, "GET CLIENT GROUP OBJECT ERROR"),
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
        transaction
          .insert(replicacheClientGroups)
          .values({
            id: clientGroupObject.id,
            spaceRecordVersion: clientGroupObject.spaceRecordVersion,
          })
          .onConflictDoUpdate({
            target: replicacheClientGroups.id,
            set: {
              spaceRecordVersion: clientGroupObject.spaceRecordVersion,
            },
          }),
      ).pipe(
        Effect.orDieWith((e) =>
          UnknownExceptionLogger(e, "SET CLIENT GROUP OBJECT ERROR"),
        ),
      ),
    );
  });
export const setSpaceRecord = ({
  spaceRecord,
  transaction,
}: {
  spaceRecord: Array<SubspaceRecord>;
  transaction: Transaction;
}): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
    yield* _(
      Effect.tryPromise(() =>
        transaction
          .insert(replicacheSubspaceRecords)
          //@ts-ignore
          .values(spaceRecord),
      ).pipe(
        Effect.orDieWith((e) =>
          UnknownExceptionLogger(e, "SET SPACE RECORD ERROR"),
        ),
      ),
    );
  });
export const deleteSpaceRecord = ({
  keys,
  transaction,
}: {
  keys: string[];
  transaction: Transaction;
}): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
    if (keys.length === 0) return;

    yield* _(
      Effect.tryPromise(() =>
        transaction
          .delete(replicacheSubspaceRecords)
          .where(inArray(replicacheSubspaceRecords.id, keys)),
      ).pipe(
        Effect.orDieWith((e) =>
          UnknownExceptionLogger(e, "DELETE SPACE RECORD ERROR"),
        ),
      ),
    );
  });
export {
  createSpacePatch,
  createSpaceResetPatch,
  diffClientRecords,
  diffSpaceRecords,
  getCurrentClientRecord,
  getCurrentSpaceRecord,
  getPrevClientRecord,
  getPrevSpaceRecord,
};
