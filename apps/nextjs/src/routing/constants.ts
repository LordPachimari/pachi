import type { Product } from "@pachi/db";

const TABLE_QUERY_OPTIONS = ["page", "perPage", "sort"] as const;
const PRODUCT_TABLE_QUERY_OPTIONS: (keyof Pick<Product, "title" | "status">)[] =
  ["title", "status"] as const;

const QUERY_OPTION_NAMES = [
  ...TABLE_QUERY_OPTIONS,
  ...PRODUCT_TABLE_QUERY_OPTIONS,
];
export { TABLE_QUERY_OPTIONS, PRODUCT_TABLE_QUERY_OPTIONS, QUERY_OPTION_NAMES };
