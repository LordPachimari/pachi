import { createInsertSchema } from "drizzle-valibot";
import {
  array,
  boolean,
  enumType,
  merge,
  object,
  optional,
  partial,
  pick,
  record,
  string,
  type Output,
} from "valibot";

import {
  addresses,
  countries,
  currencies,
  customer_groups,
  money_amount,
  price_lists,
  product_collections,
  product_option_values,
  product_options,
  product_tags,
  product_types,
  product_variants,
  products,
  regions,
  sales_channels,
  shipping_options,
  stores,
  tax_rates,
  users,
} from "../schema";
import { ImageSchema } from "./common";

export const CurrencySchema = createInsertSchema(currencies);
export type Currency = Output<typeof CurrencySchema>;

export const StoreSchema = merge([
  createInsertSchema(stores),
  object({ currencies: optional(array(string())) }),
]);
export const StoreUpdatesSchema = object({
  name: optional(string()),
  currencies: optional(array(string())),
});
export type StoreUpdates = Output<typeof StoreUpdatesSchema>;
export type Store = Output<typeof StoreSchema> & { products?: Product[] };
export const UserSchema = merge([
  createInsertSchema(users),
  object({
    stores: optional(array(StoreSchema)),
  }),
]);
export type User = Output<typeof UserSchema> & { stores?: Store[] };

export const CountrySchema = createInsertSchema(countries);
export type Country = Output<typeof CountrySchema>;

export const RegionSchema = merge([
  createInsertSchema(regions),
  object({
    countries: array(CountrySchema),
    automatic_taxes: boolean(),
    gift_cards_taxable: boolean(),
  }),
]);
export type Region = Output<typeof RegionSchema>;

export const AddressSchema = createInsertSchema(addresses);
export type Address = Output<typeof AddressSchema>;

export const CustomerGroupSchema = merge([
  createInsertSchema(customer_groups),
  object({
    customers: array(UserSchema),
  }),
]);
export type CustomerGroup = Output<typeof CustomerGroupSchema>;
export const CustomerGroupUpdatesSchema = pick(CustomerGroupSchema, [
  "name",
  "description",
]);
export type CustomerGroupUpdates = Output<typeof CustomerGroupUpdatesSchema>;

export const PriceListSchema = merge([
  createInsertSchema(price_lists),
  object({
    customer_groups: optional(array(CustomerGroupSchema)),
  }),
]);
export type PriceList = Output<typeof PriceListSchema> & {
  prices?: MoneyAmount[];
};
export const PriceListUpdatesSchema = pick(PriceListSchema, [
  "name",
  "description",
  "expires_at",
  "status",
  "starts_at",
  "includes_tax",
]);
export type PriceListUpdates = Output<typeof PriceListUpdatesSchema>;

export const MoneyAmountSchema = merge([
  createInsertSchema(money_amount),
  object({
    currency: optional(CurrencySchema),
    price_list: optional(PriceListSchema),
  }),
]);
export type MoneyAmount = Output<typeof MoneyAmountSchema>;
export const MoneyAmountUpdatesSchema = pick(MoneyAmountSchema, ["amount"]);
export type MoneyAmountUpdates = Output<typeof MoneyAmountUpdatesSchema>;

export const TaxRateSchema = createInsertSchema(tax_rates);
export type TaxRate = Output<typeof TaxRateSchema>;

export const SalesChannelSchema = createInsertSchema(sales_channels);
export type SalesChannel = Output<typeof SalesChannelSchema>;

export const ProductCollectionSchema = createInsertSchema(product_collections);
export type ProductCollection = Output<typeof ProductCollectionSchema>;
export const ProductCollectionUpdatesSchema = pick(ProductCollectionSchema, [
  "handle",
  "title",
]);
export type ProductCollectionUpdates = Output<
  typeof ProductCollectionUpdatesSchema
>;

export const ProductOptionValueSchema = merge([
  createInsertSchema(product_option_values),
  object({}),
]);
export type ProductOptionValue = Output<typeof ProductOptionValueSchema>;
export const ProductOptionValueUpdatesSchema = pick(ProductOptionValueSchema, [
  "value",
]);
export type ProductOptionValueUpdates = Output<
  typeof ProductOptionValueUpdatesSchema
>;

export const ProductOptionSchema = merge([
  createInsertSchema(product_options),
  object({
    values: optional(array(ProductOptionValueSchema)),
  }),
]);
export type ProductOption = Output<typeof ProductOptionSchema>;
export const ProductOptionUpdatesSchema = pick(ProductOptionSchema, ["name"]);
export type ProductOptionUpdates = Output<typeof ProductOptionUpdatesSchema>;

export const ProductTagSchema = createInsertSchema(product_tags);
export type ProductTag = Output<typeof ProductTagSchema>;

export const ProductTypeSchema = createInsertSchema(product_types);
export type ProductType = Output<typeof ProductTypeSchema>;

export const ProductVariantSchema = merge([
  createInsertSchema(product_variants),
  object({
    options: optional(array(ProductOptionValueSchema)),
    prices: optional(array(MoneyAmountSchema)),
    images: optional(array(ImageSchema)),
  }),
]);
export type ProductVariant = Output<typeof ProductVariantSchema> & {
  product?: PublishedProduct;
};
export const ProductVariantUpdatesSchema = pick(ProductVariantSchema, [
  "title",
  "barcode",
  "ean",
  "height",
  "hs_code",
  "inventory_quantity",
  "metadata",
  "material",
  "mid_code",
  "sku",
  "weight",
  "width",
  "upc",
  "allow_backorder",
]);
export type ProductVariantUpdates = Output<typeof ProductVariantUpdatesSchema>;

export const ProductSchema = merge([
  createInsertSchema(products),
  object({
    variants: optional(array(ProductVariantSchema)),
    options: optional(array(ProductOptionSchema)),
    sales_channels: optional(array(SalesChannelSchema)),
    collection: optional(ProductCollectionSchema),
    tags: optional(array(ProductTagSchema)),
    type: optional(ProductTypeSchema),
    thumbnail: optional(ImageSchema),
    metadata: optional(record(string(), string())),
    images: optional(array(ImageSchema)),
    tax_rates: optional(array(TaxRateSchema)),
    discountable: boolean(),
  }),
]);
export const PublishedProductSchema = merge([
  ProductSchema,
  object({
    title: string(),
    description: string(),
    thumbnail: ImageSchema,
    images: array(ImageSchema),
    prices: array(MoneyAmountSchema),
    handle: string(),
    status: enumType(["draft", "proposed", "published", "rejected"]),
    discountable: boolean(),
    variants: array(ProductVariantSchema),
    options: array(ProductOptionSchema),
  }),
]);
export type PublishedProduct = Output<typeof PublishedProductSchema>;
export const ProductUpdatesSchema = partial(
  pick(ProductSchema, ["title", "description", "discountable", "status"]),
);
export type ProductUpdates = Output<typeof ProductUpdatesSchema>;
export const UpdateProductSchema = object({
  id: string(),
  updates: ProductUpdatesSchema,
});
export type UpdateProduct = Output<typeof UpdateProductSchema>;
export type Product = Output<typeof ProductSchema>;

export const ShippingOptionSchema = createInsertSchema(shipping_options);
export type ShippingOption = Output<typeof ShippingOptionSchema>;
