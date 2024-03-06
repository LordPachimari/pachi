import type { TableName } from '.'
import {
  cartItems,
  carts,
  customerGroups,
  customersToGroups,
  jsonTable,
  priceLists,
  prices,
  productCollections,
  productOptions,
  productOptionValues,
  productOptionValuesToProductVariants,
  products,
  productsToTags,
  productTags,
  productVariants,
  stores,
  users,
} from './schema'

type UserTable = typeof users
type ProductTable = typeof products
// export type StoreTable = typeof Store;
type ProductVariantTable = typeof productVariants
type ProductOptionTable = typeof productOptions
type ProductOptionValueTable = typeof productOptionValues
// export type ProductCategoryTable = typeof ProductCategory;
type ProductCollectionTable = typeof productCollections
export type CartTable = typeof carts
export type CartItemTable = typeof cartItems
// export type RegionTable = typeof Region;
// export type CartItemAdjustmentTable = typeof CartItemAdjustment;
type CustomerGroupTable = typeof customerGroups
type CustomerToGroupTable = typeof customersToGroups
type PriceListTable = typeof priceLists
type PriceTable = typeof prices
type StoreTable = typeof stores
type ProductTagTable = typeof productTags
type ProductToTagTable = typeof productsToTags
type ProductOptionValuesToProductVariantsTable =
  typeof productOptionValuesToProductVariants
export type JsonTable = typeof jsonTable

export type Table =
  | UserTable
  | ProductTable
  // | StoreTable
  | ProductVariantTable
  | ProductOptionTable
  | ProductOptionValueTable
  // | ProductCategoryTable
  | ProductCollectionTable
  | CartTable
  | CartItemTable
  // | RegionTable
  // | CartItemAdjustmentTable
  | CustomerGroupTable
  | CustomerToGroupTable
  | PriceListTable
  | PriceTable
  | StoreTable
  | ProductTagTable
  | ProductToTagTable
  | ProductOptionValuesToProductVariantsTable
  | JsonTable

export const tableNamesMap: Record<TableName, Table> = {
  users,
  products,
  productVariants,
  productOptions,
  productOptionValues,
  stores,
  // product_categorys,
  productCollections,
  carts,
  cartItems,
  // line_item_adjustments,
  // region,
  customerGroups,
  customersToGroups,
  priceLists,
  prices,
  productTags,
  productsToTags,
  productOptionValuesToProductVariants,
  json: jsonTable,
}
export type TableNamesMap = typeof tableNamesMap
