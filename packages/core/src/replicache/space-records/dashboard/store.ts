import { Effect, pipe } from "effect"
import { log } from "effect/Console"

import { withDieErrorLogger } from "@pachi/utils"

import type { GetClientViewDataWithTable } from "../types"

export const storeCVD: GetClientViewDataWithTable = ({
  transaction,
  userId,
  isFullItems = false,
}) => {
  if (!userId) return Effect.succeed([{ cvd: [], tableName: "products" }])

  const cvd = pipe(
    Effect.tryPromise(() =>
      isFullItems
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
        data?.stores.map((store) => [
          {
            cvd: [store],
            tableName: "stores" as const,
          },
          {
            cvd: store.products,
            tableName: "products" as const,
          },
        ]),
    ),
    Effect.map((data) => data?.flat() ?? []),
    Effect.orDieWith((e) => withDieErrorLogger(e, "StoreCVD space record")),
  )

  return cvd
}
