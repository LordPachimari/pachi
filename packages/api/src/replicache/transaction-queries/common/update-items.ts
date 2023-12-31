import { and, eq, sql } from "drizzle-orm";
import type { ReadonlyJSONObject } from "replicache";

import {
  tableNamesMap,
  users,
  type TableName,
  type Transaction,
} from "@pachi/db";

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
}) => {
  const queries = [];
  if (tableName === "users") {
    for (const { id, value } of items) {
      queries.push(
        transaction
          .update(users)
          .set({
            ...value,
            version: sql`${users.version} + 1`,
          })
          .where(and(eq(users.id, id), eq(users.id, userId)))
          .execute(),
      );
    }
  } else {
    const table = tableNamesMap[tableName];
    console.log("table", table);
    for (const { id, value } of items) {
      queries.push(
        transaction
          .update(table)
          .set({
            ...value,
            version: sql`${table.version} + 1`,
          })
          .where(eq(table.id, id))
          .execute(),
      );
    }
  }
  return queries;
};
