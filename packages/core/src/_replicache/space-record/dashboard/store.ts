import { Effect, pipe } from "effect";
import { mapToObj } from "remeda";

import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetClientViewRecordWTableName } from "../types";

export const storeCVD: GetClientViewRecordWTableName = ({
  transaction,
  userId,
  fullRows = false,
}) => {
  if (!userId) return Effect.succeed([{ cvd: [], tableName: "products" }]);

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
          return {
            stores: { [store.id]: store.version },
            products: mapToObj(store.products, (product) => [
              product.id,
              product.version,
            ]),
          };
        }),
    ),
    Effect.map((data) =>
      data
        ? data.reduce(
            (acc, item) => {
              return {
                stores: {
                  ...acc.stores,
                  ...item.stores,
                },
                products: {
                  ...acc.products,
                  ...item.products,
                },
              };
            },
            {
              stores: {},
              products: {},
            },
          )
        : {},
    ),
    Effect.orDieWith((e) =>
      UnknownExceptionLogger(e, "ERROR RETRIEVING STORE CVD"),
    ),
  );

  return cvd;
};
