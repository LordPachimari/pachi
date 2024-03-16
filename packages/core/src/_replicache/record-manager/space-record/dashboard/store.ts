import { Effect, pipe } from "effect";

import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetRowsWTableName } from "../types";

export const storeCVD: GetRowsWTableName = ({
  transaction,
  userId,
  fullRows = false,
}) => {
  if (!userId) return Effect.succeed([]);

  const cvd = pipe(
    Effect.tryPromise(() =>
      fullRows
        ? transaction.query.users.findFirst({
            where: (user, { eq }) => eq(user.id, userId),
            with: {
              stores: {
                with: {
                  products: {
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
                    },
                  },
                },
              },
            },
          })
        : transaction.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
            with: {
              stores: {
                columns: {
                  id: true,
                  version: true,
                },
                with: {
                  products: {
                    columns: {
                      id: true,
                      version: true,
                    },
                  },
                },
              },
            },
          }),
    ),
    Effect.map(
      (data) =>
        data?.stores.map((store) => {
          return [
            { tableName: "stores" as const, rows: [store] },
            { tableName: "products" as const, rows: store.products },
          ];
        }),
    ),
    Effect.map((data) => (data ? data.flat() : [])),
    Effect.orDieWith((e) =>
      UnknownExceptionLogger(e, "ERROR RETRIEVING STORE ROWS"),
    ),
  );

  return cvd;
};
