import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { enumType, type Output } from "valibot";

import {
  money_amount,
  money_amount_relations,
  product_collections,
  product_option_relations,
  product_option_values,
  product_option_values_relations,
  product_options,
  product_variant_relations,
  product_variants,
  products,
  products_relations,
  replicache_clients,
  stores,
  stores_relations,
  users,
  users_relations,
} from "./schema";

export * from "./schema";
export * from "./table-name";
export * from "./validators/common";
export * from "./validators/schema";

export const schema = {
  products,
  users,
  replicache_clients,
  product_collections,
  product_variants,
  money_amount,
  product_options,
  product_option_values,
  product_option_values_relations,
  product_option_relations,
  products_relations,
  product_variant_relations,
  money_amount_relations,
  stores,
  users_relations,
  stores_relations,
};

const tableName = [
  "users",
  "products",
  // "notification",
  "product_variants",
  "product_options",
  "product_option_values",
  // "store",
  // "sales_channel",
  // "product_to_sales_channel",
  "product_collections",
  // "product_category",
  // "cart",
  // "line_item",
  // "line_item_adjustment",
  // "region",
  "product_collections",
  "customer_groups",
  "customers_to_groups",
  "price_lists",
  "money_amount",
  "stores",
] as const;

const pool = new Pool({ connectionString: "" });
const db = drizzle(pool, { schema });

export const TableNameSchema = enumType(tableName);
export type TableName = Output<typeof TableNameSchema>;
export type Db = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
