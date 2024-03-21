import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { enumType, type Output } from "valibot";

import * as schema from "./schema";

export * as schema from "./schema";
export * from "./table-name";

const tableName = [
  "users",
  "products",
  "productVariants",
  "productOptions",
  "productOptionValues",
  "productTags",
  "productCollections",
  // "product_category",
  "carts",
  "cartItems",
  "productCollections",
  "productTags",
  "productsToTags",
  "customerGroups",
  "customersToGroups",
  "priceLists",
  "prices",
  "stores",
  "productOptionValuesToProductVariants",
  "json",
] as const;

export const pool = new Pool({
  connectionString: "",
});
export const db = drizzle(pool, { schema });
export const TableNameSchema = enumType(tableName);
export type TableName = Output<typeof TableNameSchema>;
export type Db = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
