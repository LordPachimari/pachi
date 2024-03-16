import { eq, inArray, sql } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { isDefined, keys, mapToObj, toPairs } from "remeda";
import type { PatchOperation, ReadonlyJSONObject } from "replicache";

import {
  tableNamesMap,
  type ClientGroupObject,
  type TableName,
  type Transaction,
} from "@pachi/db";
import {
  jsonTable,
  replicacheClientGroups,
  replicacheClients,
} from "@pachi/db/schema";
import { UnknownExceptionLogger, type ExtractEffectValue } from "@pachi/utils";

import {
  AuthorizationError,
  SPACE_RECORD,
  type ClientViewRecord,
  type PermissionDenied,
  type SpaceID,
  type SpaceRecord,
} from "../../schema-and-types";
import type {
  ClientRecordDiff,
  ReplicacheRecordBase,
  SpaceRecordDiff,
} from "../main";
import {
  deleteItems_,
  getClientViewRecordWTables,
  setItems_,
  updateItems_,
} from "../transaction-queries";
import { getClientLastMutationIdAndVersion_ } from "../transaction-queries/get-client-last-mutations-ids";

const getPrevSpaceRecord = <T extends SpaceID>({
  key,
  spaceID,
  transaction,
  subspaceIDs,
}: {
  key: string;
  spaceID: T;
  transaction: Transaction;
  subspaceIDs: Array<SpaceRecord[T][number]>;
}): ReturnType<ReplicacheRecordBase["getPrevSpaceRecord"]> => {
  return Effect.gen(function* (_) {
    const subIDs = subspaceIDs.length > 0 ? subspaceIDs : SPACE_RECORD[spaceID];

    return yield* _(
      pipe(
        Effect.tryPromise(() =>
          transaction.query.spaceRecords.findMany({
            columns: {
              subspaceID: true,
              record: true,
            },
            where: ({ subspaceID, id }, { inArray, eq, and }) =>
              and(eq(id, key), inArray(subspaceID, subIDs)),
          }),
        ),
        Effect.map((records) =>
          mapToObj(records, (record) => [record.subspaceID, record.record]),
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
  userId,
}: {
  spaceID: T;
  transaction: Transaction;
  subspaceIDs: Array<SpaceRecord[T][number]>;
  userId: string | undefined;
}): ReturnType<ReplicacheRecordBase["getCurrentSpaceRecord"]> => {
  return Effect.gen(function* (_) {
    const subIDs = subspaceIDs ?? SPACE_RECORD[spaceID];

    return yield* _(
      pipe(
        Effect.forEach(
          subIDs,
          (subspaceID) =>
            getClientViewRecordWTables({
              spaceID,
              subspaceID,
              transaction,
              userId,
              fullRows: false,
            })
              .pipe(
                Effect.map((clientViewRecordWTable) => {
                  return {
                    subspaceID,
                    clientViewRecordWTable,
                  };
                }),
              )
              .pipe(Effect.orDie),

          {
            concurrency: "unbounded",
          },
        ),
      ),
      Effect.map((subspaceClientViewRecord) =>
        mapToObj(subspaceClientViewRecord, (record) => [
          record.subspaceID,
          record.clientViewRecordWTable,
        ]),
      ),
    );
  });
};

const diffSpaceRecords = <T extends SpaceID>(
  prevRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordBase["getPrevSpaceRecord"]>
  >,
  currentRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordBase["getPrevSpaceRecord"]>
  >,
  spaceID: T,
): ReturnType<ReplicacheRecordBase["diffSpaceRecords"]> => {
  return Effect.gen(function* (_) {
    const diff: SpaceRecordDiff = {
      deletedIDs: new Map(),
      newIDs: new Map(),
    };

    yield* _(
      Effect.forEach(
        toPairs.strict(currentRecord),
        ([subspaceID, clientViewRecordWTableName]) => {
          return Effect.sync(() => {
            const prevClientViewRecordWTableName = prevRecord[subspaceID];

            toPairs(clientViewRecordWTableName).forEach(
              ([tableName_, currentClientViewRecord]) => {
                const tableName = tableName_ as TableName;
                const newIDs = diff.newIDs.get(tableName) ?? new Set();
                const deletedIDs = diff.deletedIDs.get(tableName) ?? new Set();
                const prevClientViewRecord =
                  prevClientViewRecordWTableName[tableName] ?? {};

                const addNewIDs = Effect.forEach(
                  toPairs(currentClientViewRecord),
                  ([id, version]) =>
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
                      if (!isDefined(currentClientViewRecord[id])) {
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
              },
            );
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
}): ReturnType<ReplicacheRecordBase["getPrevClientRecord"]> =>
  Effect.gen(function* (_) {
    if (!key) {
      return {};
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

    return {};
  });

const getCurrentClientRecord = ({
  transaction,
  clientGroupID,
}: {
  transaction: Transaction;
  clientGroupID: string;
}): ReturnType<ReplicacheRecordBase["getCurrentClientRecord"]> =>
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
    Effect.map((clients) =>
      clients.length > 0
        ? mapToObj(clients, (client) => [client.id, client.lastMutationID])
        : {},
    ),
    Effect.orDieWith((e) =>
      UnknownExceptionLogger(e, "GET CURRENT CLIENT RECORD ERROR"),
    ),
  );

const diffClientRecords = (
  prevRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordBase["getPrevClientRecord"]>
  >,
  currentRecord: ExtractEffectValue<
    ReturnType<ReplicacheRecordBase["getCurrentClientRecord"]>
  >,
): ReturnType<ReplicacheRecordBase["diffClientRecords"]> => {
  return Effect.gen(function* (_) {
    const diff: ClientRecordDiff = {};

    yield* _(
      Effect.forEach(
        toPairs(currentRecord),
        ([id, lastMutationID]) => {
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
}): Effect.Effect<
  ReturnType<ReplicacheRecordBase["createSpacePatch"]>,
  never,
  never
> => {
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

const resetSpace = <T extends SpaceID>({
  spaceID,
  transaction,
  userId,
}: {
  spaceID: T;
  userId: string | undefined;
  transaction: Transaction;
}): Effect.Effect<
  { patch: PatchOperation[]; newSpaceRecord: SpaceRecord[T] },
  never,
  never
> =>
  Effect.gen(function* (_) {
    const patch: PatchOperation[] = [
      {
        op: "clear" as const,
      },
    ];
    const subspaceIDs = SPACE_RECORD[spaceID];

    const record = yield* _(
      Effect.forEach(
        subspaceIDs,
        (subspaceID) =>
          getClientViewRecordWTables({
            spaceID,
            subspaceID,
            transaction,
            userId,
            fullRows: true,
          }),
        {
          concurrency: "unbounded",
        },
      ),
    );
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
                    optionValue: {
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
    const table = tableNamesMap[tableName];

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
export const getPrevSpaceRecord_ = <T extends SpaceID>({
  key,
  transaction,
}: {
  key: string | undefined;
  transaction: Transaction;
  spaceID: T;
}): Effect.Effect<SpaceRecord[T] | undefined, never, never> =>
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
          UnknownExceptionLogger(e, "getPrevSpaceRecord error"),
        ),
      ),
    );

    if (spaceRecord?.value) return spaceRecord.value as SpaceRecord[T];

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
          UnknownExceptionLogger(e, "getClientGroupObject error"),
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
          UnknownExceptionLogger(e, "setClientGroupObject error"),
        ),
      ),
    );
  });
export const setSpaceRecord = <T extends SpaceID>({
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
        Effect.orDieWith((e) =>
          UnknownExceptionLogger(e, "setSpaceRecord error"),
        ),
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
          UnknownExceptionLogger(e, "delete space record error"),
        ),
      ),
    );
  });

export const getClient = ({
  transaction,
  clientID,
  clientGroupID,
}: {
  transaction: Transaction;
  clientID: string;
  clientGroupID: string;
}): Effect.Effect<ClientRecord, AuthorizationError, never> => {
  return Effect.gen(function* (_) {
    const client = yield* _(
      Effect.tryPromise(() =>
        transaction.query.replicacheClients.findFirst({
          where: (client, { eq }) => eq(client.id, clientID),
        }),
      ).pipe(
        Effect.orDieWith((e) => UnknownExceptionLogger(e, "getClient error")),
      ),
    );

    if (!client)
      return {
        id: clientID,
        clientGroupID: "",
        lastMutationID: 0,
      };

    if (client.clientGroupID !== clientGroupID) {
      yield* _(
        Effect.fail(
          new AuthorizationError({ message: "clientGroupID does not match" }),
        ),
      );
    }

    return client;
  });
};
export const setClient = ({
  transaction,
  client,
}: {
  client: ClientRecord;
  transaction: Transaction;
}): Effect.Effect<void, never, never> =>
  Effect.tryPromise(() =>
    transaction
      .insert(replicacheClients)
      //@ts-ignore
      .values(client)
      .onConflictDoUpdate({
        target: replicacheClients.id,
        set: {
          //@ts-ignore
          lastMutationID: sql.placeholder("lastMutationID"),
        },
      }),
  ).pipe(Effect.orDieWith((e) => UnknownExceptionLogger(e, "setClient error")));
const getClientLastMutationIdsAndVersion = ({
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

export {
  createSpacePatch,
  diffClientRecords,
  diffSpaceRecords,
  getCurrentClientRecord,
  getCurrentSpaceRecord,
  getPrevClientRecord,
  getPrevSpaceRecord,
};
