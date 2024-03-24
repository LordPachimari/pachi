import { Context } from "effect";

import type { TableNameToTableMap, Transaction } from "@pachi/db";

class Database extends Context.Tag("Database")<
  Database,
  {
    readonly userID: string | undefined;
    readonly transaction: Transaction;
    readonly tableNameToTableMap: TableNameToTableMap;
  }
>() {}

export { Database };
