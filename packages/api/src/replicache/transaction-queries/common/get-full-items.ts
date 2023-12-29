import { inArray } from "drizzle-orm";

import { tableNamesMap, type TableName, type Transaction } from "@pachi/db";
import { users } from "@pachi/db/schema";

export const getFullItems = async ({
  tableName,
  keys,
  transaction,
}: {
  tableName: TableName;
  keys: string[];
  transaction: Transaction;
}): Promise<Record<string, unknown>[]> => {
  if (keys.length === 0) {
    return Promise.resolve([]);
  }
  if (tableName === "users") {
    const result = await transaction
      .select()
      .from(users)
      .where(inArray(users.id, keys));
    return result;
  } else if (tableName === "products") {
    const result = await transaction.query.products.findMany({
      where: (Product) => inArray(Product.id, keys),
      with: {
        // seller: {
        //   id: true,
        //   name: true,
        // },
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
    });
    return result;
  } else {
    const table = tableNamesMap[tableName];
    const result = await transaction
      .select()
      .from(table)
      //@ts-ignore
      .where(inArray(table.id, keys));
    return result;
  }
};
