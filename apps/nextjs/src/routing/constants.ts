import type { Client } from "@pachi/validators";

const TABLE_QUERY_OPTIONS = ["page", "pageSize"] as const;
const PRODUCT_QUERY_OPTIONS: (keyof Pick<
  Client.Product,
  "title" | "status"
>)[] = ["title", "status"] as const;

const PRODUCT_TABLE_QUERY_OPTIONS = [
  ...TABLE_QUERY_OPTIONS,
  ...PRODUCT_QUERY_OPTIONS,
] as const;

const QUERY_OPTION_NAMES = [...PRODUCT_QUERY_OPTIONS, ...TABLE_QUERY_OPTIONS];

export {
  TABLE_QUERY_OPTIONS,
  PRODUCT_QUERY_OPTIONS,
  QUERY_OPTION_NAMES,
  PRODUCT_TABLE_QUERY_OPTIONS,
};
