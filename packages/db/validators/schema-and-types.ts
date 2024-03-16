import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  replicacheClientGroups,
  replicacheClients,
  salesChannels,
  session,
  shippingOptions,
  stores,
  taxRates,
  users,
} from "../schema";
import { carts } from "../schema/cart";
import { cartItemAdjustments, cartItems } from "../schema/cart-item";
import { discounts } from "../schema/discount";
import { discountConditions } from "../schema/discount-condition";
import { payments } from "../schema/payment";
import { shippingMethods } from "../schema/shipping-method";
import { trackingLinks } from "../schema/tracking-link";
import { ImageSchema } from "./common";

export const CurrencySchema = createInsertSchema(currencies);
export type Currency = z.infer<typeof CurrencySchema>;
export const StoreSchema = createInsertSchema(stores).extend({
  currencies: z.array(z.string()).optional(),
});
export const StoreUpdatesSchema = StoreSchema.pick({
  name: true,
  currencies: true,
});
export type StoreUpdates = z.infer<typeof StoreUpdatesSchema>;
export type Store = z.infer<typeof StoreSchema> & {
  products?: Product[];
};
export const UserSchema = createInsertSchema(users);
export type User = z.infer<typeof UserSchema> & { stores?: Store[] };
export const CountrySchema = createInsertSchema(countries);
export type Country = z.infer<typeof CountrySchema>;
export const RegionSchema = createInsertSchema(regions).extend({
  countries: z.array(CountrySchema),
  automaticTaxes: z.boolean(),
  giftCardsTaxable: z.boolean(),
});
export type Region = z.infer<typeof RegionSchema>;
export const AddressSchema = createInsertSchema(addresses);
export type Address = z.infer<typeof AddressSchema>;
export const CustomerGroupSchema = createInsertSchema(customerGroups).extend({
  customers: z.array(UserSchema).optional(),
});
export type CustomerGroup = z.infer<typeof CustomerGroupSchema>;
export const CustomerGroupUpdatesSchema = CustomerGroupSchema.pick({
  name: true,
  description: true,
});
export type CustomerGroupUpdates = z.infer<typeof CustomerGroupUpdatesSchema>;
export const PriceListSchema = createInsertSchema(priceLists).extend({
  customerGroups: z.array(CustomerGroupSchema).optional(),
});
export type PriceList = z.infer<typeof PriceListSchema> & {
  prices?: Price[];
};
export const PriceListUpdatesSchema = PriceListSchema.pick({
  name: true,
  description: true,
  expiresAt: true,
  status: true,
  startsAt: true,
  includesTax: true,
});
export type PriceListUpdates = z.infer<typeof PriceListUpdatesSchema>;
export const PriceSchema = createInsertSchema(prices).extend({
  currency: CurrencySchema.optional(),
  priceList: PriceListSchema.optional(),
});
export type Price = z.infer<typeof PriceSchema>;
export const PriceUpdatesSchema = PriceSchema.pick({
  amount: true,
});
export type PriceUpdates = z.infer<typeof PriceUpdatesSchema>;
export const TaxRateSchema = createInsertSchema(taxRates);
export type TaxRate = z.infer<typeof TaxRateSchema>;
export const SalesChannelSchema = createInsertSchema(salesChannels);
export type SalesChannel = z.infer<typeof SalesChannelSchema>;
export const ProductCollectionSchema = createInsertSchema(productCollections);
export type ProductCollection = z.infer<typeof ProductCollectionSchema>;
export const ProductCollectionUpdatesSchema = ProductCollectionSchema.pick({
  handle: true,
  title: true,
});
export type ProductCollectionUpdates = z.infer<
  typeof ProductCollectionUpdatesSchema
>;
export const ProductOptionSchema = createInsertSchema(productOptions);
export type ProductOption = z.infer<typeof ProductOptionSchema> & {
  values?: ProductOptionValue[];
};
export const ProductOptionUpdatesSchema = ProductOptionSchema.pick({
  name: true,
});
export type ProductOptionUpdates = z.infer<typeof ProductOptionUpdatesSchema>;
export const ProductOptionValueSchema = createInsertSchema(
  productOptionValues,
).extend({
  option: ProductOptionSchema.optional(),
});
export type ProductOptionValue = z.infer<typeof ProductOptionValueSchema> & {
  option?: ProductOption;
};
export const ProductOptionValueUpdatesSchema = ProductOptionValueSchema.pick({
  value: true,
});
export type ProductOptionValueUpdates = z.infer<
  typeof ProductOptionValueUpdatesSchema
>;
export const ProductTagSchema = createInsertSchema(productTags);
export type ProductTag = z.infer<typeof ProductTagSchema>;
export const ProductVariantSchema = createInsertSchema(productVariants).extend({
  prices: z.array(PriceSchema).optional(),
  images: z.array(ImageSchema).optional(),
  optionValues: z
    .array(z.object({ optionValue: ProductOptionValueSchema }))
    .optional(),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema> & {
  product?: Product;
};
export const ProductVariantUpdatesSchema = ProductVariantSchema.pick({
  title: true,
  barcode: true,
  ean: true,
  height: true,
  hsCode: true,
  quantity: true,
  metadata: true,
  material: true,
  midCode: true,
  sku: true,
  weight: true,
  width: true,
  upc: true,
  allowBackorder: true,
  length: true,
  originCountry: true,
});
export type ProductVariantUpdates = z.infer<typeof ProductVariantUpdatesSchema>;
export const ProductSchema = createInsertSchema(products).extend({
  salesChannels: z.array(SalesChannelSchema).optional(),
  collection: ProductCollectionSchema.optional(),
  tags: z.array(ProductTagSchema).optional(),
  thumbnail: ImageSchema.optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  taxRates: z.array(TaxRateSchema).optional(),
  discountable: z.boolean().optional(),
  variants: z.array(ProductVariantSchema).optional(),
});
export const PublishedProductSchema = ProductSchema.required({
  title: true,
  description: true,
  thumbnail: true,
  prices: true,
  handle: true,
  status: true,
  discountable: true,
  options: true,
}).extend({
  title: z.string(),
});
export type PublishedProduct = z.infer<typeof PublishedProductSchema> & {
  variants: ProductVariant[];
};
export const ProductUpdatesSchema = ProductSchema.pick({
  title: true,
  description: true,
  discountable: true,
  status: true,
  type: true,
});
export type ProductUpdates = z.infer<typeof ProductUpdatesSchema>;
export const UpdateProductSchema = z.object({
  id: z.string(),
  updates: ProductUpdatesSchema,
});
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type Product = z.infer<typeof ProductSchema> & {
  variants?: ProductVariant[] | undefined;
  options?: ProductOption[];
};
export const ShippingOptionSchema = createInsertSchema(shippingOptions);
export type ShippingOption = z.infer<typeof ShippingOptionSchema>;
export const DiscountConditionSchema = createInsertSchema(
  discountConditions,
).extend({
  products: z.array(ProductSchema),
  productTags: z.array(ProductTagSchema),
  productCollections: z.array(ProductCollectionSchema),
});
export type DiscountCondition = z.infer<typeof DiscountConditionSchema>;
export const DiscountRuleSchema = createInsertSchema(discounts).extend({
  conditions: z.array(DiscountConditionSchema).optional(),
});
export type DiscountRule = z.infer<typeof DiscountRuleSchema>;
export const DiscountSchema = createInsertSchema(discounts).extend({
  rule: DiscountRuleSchema,
});
export type Discount = z.infer<typeof DiscountSchema>;
export const PaymentSchema = createInsertSchema(payments);
export type PaymentSchema = z.infer<typeof PaymentSchema>;
export const CartItemAdjustmentSchema = createInsertSchema(cartItemAdjustments);
export type CartItemAdjustment = z.infer<typeof CartItemAdjustmentSchema>;
export const CartItemSchema = createInsertSchema(cartItems).extend({
  thumbnail: ImageSchema,
  variant: ProductVariantSchema.optional(),
  adjustments: z.array(CartItemAdjustmentSchema).optional(),
});
export type CartItem = z.infer<typeof CartItemSchema> & {
  variant?: ProductVariant;
};
export const CartItemUpdatesSchema = CartItemSchema.pick({
  quantity: true,
});
export type CartItemUpdates = z.infer<typeof CartItemAdjustmentSchema>;
export const ShippingMethodSchema = createInsertSchema(shippingMethods);
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export const TrackingLinkSchema = createInsertSchema(trackingLinks);
export type TrackingLink = z.infer<typeof TrackingLinkSchema>;
export const CartSchema = createInsertSchema(carts).extend({
  discounts: z.array(DiscountSchema).optional(),
  // giftCards: optional(array(GiftCardSchema)),
  context: z.record(z.string(), z.string()).optional(),
  shippingMethods: z.array(ShippingMethodSchema).optional(),
  shippingAddress: AddressSchema.optional(),
  region: RegionSchema.optional(),
  customer: UserSchema.optional(),
});
export type Cart = z.infer<typeof CartSchema> & { items?: CartItem[] };
export const CreateCartSchema = CartSchema.pick({
  regionId: true,
  id: true,
  context: true,
  salesChannelId: true,
  discounts: true,
  type: true,
  email: true,
});
export type CreateCart = z.infer<typeof CreateCartSchema>;
export const SessionSchema = createInsertSchema(session);
export type Session = z.infer<typeof SessionSchema>;
export const clientGroupSchema = createInsertSchema(replicacheClientGroups);
export type ClientGroupObject = z.infer<typeof clientGroupSchema>;
export const ReplicacheClientSchema = createInsertSchema(replicacheClients);
export type ReplicacheClient = z.infer<typeof ReplicacheClientSchema>;
