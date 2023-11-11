import { and, inArray } from "drizzle-orm";

import { tableNamesMap, type TableName, type Transaction } from "@pachi/db";

export const deleteItems_ = async ({
  tableName,
  keys,
  transaction,
}: {
  tableName: TableName;
  keys: string[];
  userId: string;
  transaction: Transaction;
}): Promise<void> => {
  const table = tableNamesMap[tableName];
  if (tableName !== "products") {
    await transaction
      .delete(table)
      .where(and(inArray(table.id, keys)))
      .execute();
  } else {
    await transaction.delete(table).where(inArray(table.id, keys)).execute();
  }
};
