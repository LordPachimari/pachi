import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { enumType, type Output } from "valibot";

import * as schema from "./schema";

export * as schema from "./schema";
export * from "./table-name";
export * from "./validators/common";
export * from "./validators/schema";

const tableName = [
  "users",
  "products",
  // "notification",
  "productVariants",
  "productOptions",
  "productOptionValues",
  "productTags",
  // "store",
  // "sales_channel",
  // "product_to_sales_channel",
  "productCollections",
  // "product_category",
  "carts",
  "cartItems",
  // "line_item_adjustment",
  // "region",
  "productCollections",
  "productTags",
  "productsToTags",
  "customerGroups",
  "customersToGroups",
  "priceLists",
  "prices",
  "stores",
] as const;
export const pool = new Pool({
  connectionString: "",
});
const db = drizzle(pool, { schema });

export const TableNameSchema = enumType(tableName);
export type TableName = Output<typeof TableNameSchema>;
export type Db = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
