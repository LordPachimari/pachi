import type { TableName } from ".";
import {
  customer_groups,
  customers_to_groups,
  money_amount,
  price_lists,
  product_collections,
  product_option_values,
  product_options,
  product_variants,
  products,
  stores,
  users,
} from "./schema";

type UserTable = typeof users;
type ProductTable = typeof products;
// export type StoreTable = typeof Store;
type ProductVariantTable = typeof product_variants;
type ProductOptionTable = typeof product_options;
type ProductOptionValueTable = typeof product_option_values;
// export type ProductCategoryTable = typeof ProductCategory;
type ProductCollectionTable = typeof product_collections;
// export type CartTable = typeof Cart;
// export type LineItemTable = typeof LineItem;
// export type RegionTable = typeof Region;
// export type LineItemAdjustmentTable = typeof LineItemAdjustment;
type CustomerGroupTable = typeof customer_groups;
type CustomerToGroupTable = typeof customers_to_groups;
type PriceListTable = typeof price_lists;
type MoneyAmountTable = typeof money_amount;
type StoreTable = typeof stores;

export type Table =
  | UserTable
  | ProductTable
  // | StoreTable
  | ProductVariantTable
  | ProductOptionTable
  | ProductOptionValueTable
  // | ProductCategoryTable
  | ProductCollectionTable
  // | CartTable
  // | LineItemTable
  // | RegionTable
  // | LineItemAdjustmentTable
  | CustomerGroupTable
  | CustomerToGroupTable
  | PriceListTable
  | MoneyAmountTable
  | StoreTable;
export const tableNamesMap: Record<TableName, Table> = {
  users,
  products,
  product_variants,
  product_options,
  product_option_values,
  stores,
  // product_categorys,
  product_collections,
  // carts,
  // line_items,
  // line_item_adjustments,
  // region,
  customer_groups,
  customers_to_groups,
  price_lists,
  money_amount,
};
export type TableNamesMap = typeof tableNamesMap;
