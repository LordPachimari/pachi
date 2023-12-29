import { eq } from "drizzle-orm";

import { type User } from "@pachi/db";
import type { ClientViewDataWithTable } from "@pachi/types";

import type { GetClientViewData } from "../../types";

export const storeCVD: GetClientViewData = async ({
  transaction,
  userId,
  isFullItems = false,
}) => {
  if (!userId) return [{ cvd: [], tableName: "products" }];
  const [user] = (
    isFullItems
      ? await Promise.all([
          transaction.query.users.findFirst({
            where: (user) => eq(user.id, userId),
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
          }),
        ])
      : await Promise.all([
          transaction.query.users.findFirst({
            where: (users) => eq(users.id, userId),
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
        ])
  ) as [user: User | undefined];
  const cvd: ClientViewDataWithTable = [];

  for (const store of user?.stores ?? []) {
    cvd.push({
      cvd: (store.products ?? []) as ClientViewDataWithTable[0]["cvd"],
      tableName: "products",
    });
    delete store.products;
    cvd.push({
      cvd: [store],
      tableName: "stores",
    });
  }

  return cvd;
};
