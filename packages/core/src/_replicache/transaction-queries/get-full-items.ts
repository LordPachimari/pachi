import { inArray } from "drizzle-orm";
import { Effect, pipe } from "effect";

import { tableNamesMap, type TableName, type Transaction } from "@pachi/db";
import { users } from "@pachi/db/schema";
import { UnknownExceptionLogger } from "@pachi/utils";

export const getFullItems = ({
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
        transaction.select().from(users).where(inArray(users.id, keys)),
      ),
      Effect.orDieWith((e) =>
        UnknownExceptionLogger(e, "get full items error"),
      ),
    );
  } else if (tableName === "products") {
    return pipe(
      Effect.tryPromise(() =>
        transaction.query.products.findMany({
          where: (Product) => inArray(Product.id, keys),
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
      Effect.orDieWith((e) =>
        UnknownExceptionLogger(e, "get full items error"),
      ),
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
      Effect.orDieWith((e) =>
        UnknownExceptionLogger(e, "get full items error"),
      ),
    );
  }
};
