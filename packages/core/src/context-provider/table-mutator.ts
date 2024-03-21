import { and, eq, inArray, sql } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { isArray, isString } from "remeda";

import { users } from "@pachi/db/schema";
import { AuthorizationError, NotFound } from "@pachi/validators";

import { Database, TableMutator } from "../..";

const TableMutatorLive = Layer.effect(
  TableMutator,
  Effect.gen(function* (_) {
    const { tableNameToTableMap, transaction, userID } = yield* _(Database);

    return {
      set(value, tableName) {
        return Effect.gen(function* (_) {
          const table = tableNameToTableMap[tableName];

          if (!userID)
            return yield* _(
              Effect.fail(
                new AuthorizationError({
                  message: "User is not authenticated",
                }),
              ),
            );

          if (!table)
            return yield* _(
              Effect.fail(
                new NotFound({
                  message: `Table name not found`,
                }),
              ),
            );

          return yield* _(
            Effect.tryPromise(() => {
              return transaction
                .insert(table)
                .values(isArray(value) ? value : [value])
                .onConflictDoNothing();
            }).pipe(Effect.orDie),
          );
        });
      },
      update(key, value, tableName) {
        return Effect.gen(function* (_) {
          const table = tableNameToTableMap[tableName];

          if (!userID)
            return yield* _(
              Effect.fail(
                new AuthorizationError({
                  message: "User is not authenticated",
                }),
              ),
            );

          if (!table)
            return yield* _(
              Effect.fail(
                new NotFound({
                  message: `Table name not found`,
                }),
              ),
            );

          return yield* _(
            Effect.tryPromise(() =>
              tableName === "users"
                ? transaction
                    .update(users)
                    .set({
                      ...value,
                      version: sql`${users.version} + 1`,
                    })
                    .where(and(eq(users.id, key), eq(users.id, userID)))
                : transaction
                    .update(table)
                    .set({
                      ...value,
                      version: sql`${table.version} + 1`,
                    })
                    .where(eq(table.id, key)),
            ).pipe(Effect.orDie),
          );
        });
      },
      delete(key, tableName) {
        return Effect.gen(function* (_) {
          const table = tableNameToTableMap[tableName];

          if (!userID)
            return yield* _(
              Effect.fail(
                new AuthorizationError({
                  message: "User is not authenticated",
                }),
              ),
            );

          if (!table)
            return yield* _(
              Effect.fail(
                new NotFound({
                  message: `Table name not found`,
                }),
              ),
            );

          return yield* _(
            Effect.tryPromise(() =>
              tableName === "users" && isString(key)
                ? transaction
                    .delete(users)
                    .where(and(eq(users.id, key), eq(users.id, userID)))
                : isString(key)
                ? transaction.delete(table).where(eq(table.id, key))
                : transaction.delete(table).where(inArray(table.id, key)),
            ).pipe(Effect.orDie),
          );
        });
      },
    };
  }),
);

export { TableMutatorLive };
