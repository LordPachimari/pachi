import { and, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import type { ReadonlyJSONObject } from "replicache";

import { tableNamesMap, type TableName, type Transaction } from "@pachi/db";
import { users } from "@pachi/db/schema";
import { PermissionDenied } from "@pachi/types";
import { withDieErrorLogger } from "@pachi/utils";

export const updateItems_ = ({
  tableName,
  items,
  userId,
  transaction,
}: {
  tableName: TableName;
  items: { id: string; value: ReadonlyJSONObject }[];
  userId: string;
  transaction: Transaction;
}): Effect.Effect<never, PermissionDenied, void> =>
  Effect.gen(function* (_) {
    const effects = items.map(({ id, value }) => {
      if (tableName === "users")
        return Effect.tryPromise({
          try: () =>
            transaction
              .update(users)
              .set({
                ...value,
                version: sql`${users.version} + 1`,
              })
              .where(and(eq(users.id, id), eq(users.id, userId))),
          catch: (error) => {
            Effect.logError(error);
            return new PermissionDenied({
              message: "Only the user can update their own profile",
            });
          },
        });
      return Effect.tryPromise(() =>
        transaction
          .update(tableNamesMap[tableName])
          .set({
            ...value,
            version: sql`${tableNamesMap[tableName].version} + 1`,
          })
          .where(eq(tableNamesMap[tableName].id, id)),
      ).pipe(
        Effect.orDieWith((e) => withDieErrorLogger(e, "updateItems error")),
      );
    });
    yield* _(Effect.all(effects, { concurrency: "unbounded" }));
  });
