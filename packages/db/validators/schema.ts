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
  customerGroups,
  priceLists,
  prices,
  productCollections,
  productOptions,
  productOptionValues,
  products,
  productTags,
  productVariants,
  regions,
  salesChannels,
  shippingOptions,
  stores,
  taxRates,
  users,
} from "../schema";
import { carts } from "../schema/cart";
import { cartItemAdjustments, cartItems } from "../schema/cart-item";
import { discounts } from "../schema/discount";
import { discountConditions } from "../schema/discount-condition";
import { fulfillments } from "../schema/fulfillment";
import { orders } from "../schema/order";
import { payments } from "../schema/payment";
import { shippingMethods } from "../schema/shipping-method";
import { swaps } from "../schema/swap";
import { trackingLinks } from "../schema/tracking-link";
import { fulfillmentStatus, ImageSchema, PaymentStatusSchema } from "./common";

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
    automaticTaxes: boolean(),
    giftCardsTaxable: boolean(),
  }),
]);
export type Region = Output<typeof RegionSchema>;

export const AddressSchema = createInsertSchema(addresses);
export type Address = Output<typeof AddressSchema>;

export const CustomerGroupSchema = merge([
  createInsertSchema(customerGroups),
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
  createInsertSchema(priceLists),
  object({
    customerGroups: optional(array(CustomerGroupSchema)),
  }),
]);
export type PriceList = Output<typeof PriceListSchema> & {
  prices?: Price[];
};
export const PriceListUpdatesSchema = pick(PriceListSchema, [
  "name",
  "description",
  "expiresAt",
  "status",
  "startsAt",
  "includesTax",
]);
export type PriceListUpdates = Output<typeof PriceListUpdatesSchema>;

export const PriceSchema = merge([
  createInsertSchema(prices),
  object({
    currency: optional(CurrencySchema),
    priceList: optional(PriceListSchema),
  }),
]);
export type Price = Output<typeof PriceSchema>;
export const PriceUpdatesSchema = pick(PriceSchema, ["amount"]);
export type PriceUpdates = Output<typeof PriceUpdatesSchema>;

export const TaxRateSchema = createInsertSchema(taxRates);
export type TaxRate = Output<typeof TaxRateSchema>;

export const SalesChannelSchema = createInsertSchema(salesChannels);
export type SalesChannel = Output<typeof SalesChannelSchema>;

export const ProductCollectionSchema = createInsertSchema(productCollections);
export type ProductCollection = Output<typeof ProductCollectionSchema>;
export const ProductCollectionUpdatesSchema = pick(ProductCollectionSchema, [
  "handle",
  "title",
]);
export type ProductCollectionUpdates = Output<
  typeof ProductCollectionUpdatesSchema
>;

export const ProductOptionValueSchema = merge([
  createInsertSchema(productOptionValues),
  object({}),
]);
export type ProductOptionValue = Output<typeof ProductOptionValueSchema> & {
  option?: ProductOption;
};
export const ProductOptionValueUpdatesSchema = pick(ProductOptionValueSchema, [
  "value",
]);
export type ProductOptionValueUpdates = Output<
  typeof ProductOptionValueUpdatesSchema
>;

export const ProductOptionSchema = createInsertSchema(productOptions);

export type ProductOption = Output<typeof ProductOptionSchema> & {
  values?: ProductOptionValue[];
};
export const ProductOptionUpdatesSchema = pick(ProductOptionSchema, ["name"]);
export type ProductOptionUpdates = Output<typeof ProductOptionUpdatesSchema>;

export const ProductTagSchema = createInsertSchema(productTags);
export type ProductTag = Output<typeof ProductTagSchema>;

export const ProductVariantSchema = merge([
  createInsertSchema(productVariants),
  object({
    prices: optional(array(PriceSchema)),
    images: optional(array(ImageSchema)),
  }),
]);
export type ProductVariant = Output<typeof ProductVariantSchema> & {
  product?: Product;
  optionValues?: { optionValue: ProductOptionValue }[];
};
export const ProductVariantUpdatesSchema = pick(ProductVariantSchema, [
  "title",
  "barcode",
  "ean",
  "height",
  "hsCode",
  "inventoryQuantity",
  "metadata",
  "material",
  "midCode",
  "sku",
  "weight",
  "width",
  "upc",
  "allowBackorder",
  "length",
  "originCountry",
]);
export type ProductVariantUpdates = Output<typeof ProductVariantUpdatesSchema>;

export const ProductSchema = merge([
  createInsertSchema(products),
  object({
    salesChannels: optional(array(SalesChannelSchema)),
    collection: optional(ProductCollectionSchema),
    tags: optional(array(ProductTagSchema)),
    thumbnail: optional(ImageSchema),
    metadata: optional(record(string(), string())),
    taxRates: optional(array(TaxRateSchema)),
    discountable: boolean(),
  }),
]);
export const PublishedProductSchema = merge([
  ProductSchema,
  object({
    title: string(),
    description: string(),
    thumbnail: ImageSchema,
    prices: array(PriceSchema),
    handle: string(),
    status: enumType(["draft", "proposed", "published", "rejected"]),
    discountable: boolean(),
    options: array(ProductOptionSchema),
  }),
]);
export type PublishedProduct = Output<typeof PublishedProductSchema> & {
  variants: ProductVariant[];
};
export const ProductUpdatesSchema = partial(
  pick(ProductSchema, [
    "title",
    "description",
    "discountable",
    "status",
    "type",
  ]),
);
export type ProductUpdates = Output<typeof ProductUpdatesSchema>;
export const UpdateProductSchema = object({
  id: string(),
  updates: ProductUpdatesSchema,
});
export type UpdateProduct = Output<typeof UpdateProductSchema>;
export type Product = Output<typeof ProductSchema> & {
  variants?: ProductVariant[];
  options?: ProductOption[];
};

export const ShippingOptionSchema = createInsertSchema(shippingOptions);
export type ShippingOption = Output<typeof ShippingOptionSchema>;

export const DiscountConditionSchema = merge([
  createInsertSchema(discountConditions),
  object({
    products: optional(array(ProductSchema)),
    productTags: optional(array(ProductTagSchema)),
    productCollections: optional(array(ProductCollectionSchema)),
  }),
]);
export type DiscountCondition = Output<typeof DiscountConditionSchema>;

export const DiscountRuleSchema = merge([
  createInsertSchema(discounts),
  object({
    conditions: optional(array(DiscountConditionSchema)),
  }),
]);
export type DiscountRule = Output<typeof DiscountRuleSchema>;

export const DiscountSchema = merge([
  createInsertSchema(discounts),
  object({
    rule: DiscountRuleSchema,
  }),
]);
export type Discount = Output<typeof DiscountSchema>;

export const PaymentSchema = createInsertSchema(payments);
export type PaymentSchema = Output<typeof PaymentSchema>;

export const CartItemAdjustmentSchema = createInsertSchema(cartItemAdjustments);
export type CartItemAdjustment = Output<typeof CartItemAdjustmentSchema>;
export const CartItemSchema = merge([
  createInsertSchema(cartItems),
  object({
    thumbnail: ImageSchema,
    variant: optional(ProductVariantSchema),
    adjustments: optional(array(CartItemAdjustmentSchema)),
  }),
]);
export type CartItem = Output<typeof CartItemSchema> & {
  variant?: ProductVariant;
};

export const CartItemUpdatesSchema = pick(CartItemSchema, ["quantity"]);
export type CartItemUpdates = Output<typeof CartItemAdjustmentSchema>;
export const UpdateCartItemSchema = object({
  id: string(),
  updates: CartItemUpdatesSchema,
  cartId: string(),
});
export type UpdateCartItem = Output<typeof UpdateCartItemSchema>;

export const ShippingMethodSchema = createInsertSchema(shippingMethods);
export type ShippingMethod = Output<typeof ShippingMethodSchema>;

export const TrackingLinkSchema = createInsertSchema(trackingLinks);

export type TrackingLink = Output<typeof TrackingLinkSchema>;

export const FulfillmentSchema = merge([
  createInsertSchema(fulfillments),
  object({ trackingLinks: optional(array(TrackingLinkSchema)) }),
]);
export type Fulfillment = Output<typeof FulfillmentSchema>;

export const SwapSchema = merge([
  createInsertSchema(swaps),
  object({
    fulfillments: array(FulfillmentSchema),
    additionalItems: optional(array(CartItemSchema)),
  }),
]);
export type Swap = Output<typeof SwapSchema>;

export const OrderSchema = merge([
  createInsertSchema(orders),
  object({
    items: array(CartItemSchema),
    discounts: optional(array(DiscountSchema)),
    // giftCards: optional(array(GiftCardSchema)),
    // giftCardTotal: number(),
    paymentStatus: PaymentStatusSchema,
    payments: array(PaymentSchema),
    // shippingAddress: AddressSchema,
    fulfillmentStatus: enumType(fulfillmentStatus),
    shippingMethods: array(ShippingMethodSchema),
    fulfillments: array(FulfillmentSchema),
    // claims: optional(array(ClaimOrderSchema)),
    swaps: optional(array(SwapSchema)),
    // customer: optional(UserSchema),
  }),
]);
export type Order = Output<typeof OrderSchema>;

export const CartSchema = merge([
  createInsertSchema(carts),
  object({
    discounts: optional(array(DiscountSchema)),
    // giftCards: optional(array(GiftCardSchema)),
    context: optional(record(string(), string())),
    shippingMethods: optional(array(ShippingMethodSchema)),
    shippingAddress: optional(AddressSchema),
    region: optional(RegionSchema),
    customer: optional(UserSchema),
  }),
]);

export type Cart = Output<typeof CartSchema> & { items?: CartItem[] };
export const CreateCartSchema = pick(CartSchema, [
  "regionId",
  "id",
  "context",
  "salesChannelId",
  "discounts",
  // "giftCards",
  "type",
  "email",
]);
export type CreateCart = Output<typeof CreateCartSchema>;
