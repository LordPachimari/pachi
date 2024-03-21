import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  addresses,
  cartItemAdjustments,
  cartItems,
  carts,
  countries,
  currencies,
  customerGroups,
  discountConditions,
  discounts,
  payments,
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
  session,
  shippingOptions,
  stores,
  taxRates,
  trackingLinks,
  users,
} from "@pachi/db/schema";

import { ImageSchema, type Image } from "../..";

export const CurrencySchema = createInsertSchema(currencies);
export type Currency = z.infer<typeof CurrencySchema>;
export const StoreSchema = createInsertSchema(stores).extend({
  currencies: z.array(z.string()).optional(),
});
export type Store = z.infer<typeof StoreSchema>;
export const UserSchema = createInsertSchema(users);
export type User = z.infer<typeof UserSchema>;
export const CountrySchema = createInsertSchema(countries);
export type Country = z.infer<typeof CountrySchema>;
export const RegionSchema = createInsertSchema(regions);
export type Region = z.infer<typeof RegionSchema>;
export const AddressSchema = createInsertSchema(addresses);
export type Address = z.infer<typeof AddressSchema>;
export const CustomerGroupSchema = createInsertSchema(customerGroups);
export type CustomerGroup = z.infer<typeof CustomerGroupSchema>;
export const PriceListSchema = createInsertSchema(priceLists);
export type PriceList = z.infer<typeof PriceListSchema>;
export const PriceSchema = createInsertSchema(prices);
export type Price = z.infer<typeof PriceSchema>;
export const TaxRateSchema = createInsertSchema(taxRates);
export type TaxRate = z.infer<typeof TaxRateSchema>;
export const SalesChannelSchema = createInsertSchema(salesChannels);
export type SalesChannel = z.infer<typeof SalesChannelSchema>;
export const ProductCollectionSchema = createInsertSchema(productCollections);
export type ProductCollection = z.infer<typeof ProductCollectionSchema>;
export const ProductOptionSchema = createInsertSchema(productOptions);
export type ProductOption = z.infer<typeof ProductOptionSchema>;
export const ProductOptionUpdatesSchema = ProductOptionSchema.pick({
  name: true,
});
export const ProductOptionValueSchema = createInsertSchema(productOptionValues);
export type ProductOptionValue = z.infer<typeof ProductOptionValueSchema>;
export const ProductTagSchema = createInsertSchema(productTags);
export type ProductTag = z.infer<typeof ProductTagSchema>;
export const ProductVariantSchema = createInsertSchema(productVariants).extend({
  images: z.array(ImageSchema).optional(),
});
export type ProductVariant = Omit<
  z.infer<typeof ProductVariantSchema>,
  "images"
> & {
  images?: Image[];
};
export const ProductSchema = createInsertSchema(products);
export type Product = z.infer<typeof ProductSchema> & { thumbnail?: Image };
export const PublishedProductSchema = ProductSchema.required({
  title: true,
  description: true,
  thumbnail: true,
  prices: true,
  handle: true,
  status: true,
  discountable: true,
  options: true,
});
export type PublishedProduct = z.infer<typeof PublishedProductSchema>;
export const ShippingOptionSchema = createInsertSchema(shippingOptions);
export type ShippingOption = z.infer<typeof ShippingOptionSchema>;
export const DiscountConditionSchema = createInsertSchema(discountConditions);
export type DiscountCondition = z.infer<typeof DiscountConditionSchema>;
export const DiscountRuleSchema = createInsertSchema(discounts);
export type DiscountRule = z.infer<typeof DiscountRuleSchema>;
export const DiscountSchema = createInsertSchema(discounts);
export type Discount = z.infer<typeof DiscountSchema>;
export const PaymentSchema = createInsertSchema(payments);
export type PaymentSchema = z.infer<typeof PaymentSchema>;
export const CartItemAdjustmentSchema = createInsertSchema(cartItemAdjustments);
export type CartItemAdjustment = z.infer<typeof CartItemAdjustmentSchema>;
export const CartItemSchema = createInsertSchema(cartItems);
export type CartItem = z.infer<typeof CartItemSchema>;
export const CartItemUpdatesSchema = CartItemSchema.pick({
  quantity: true,
});
export type CartItemUpdates = z.infer<typeof CartItemAdjustmentSchema>;
export const TrackingLinkSchema = createInsertSchema(trackingLinks);
export type TrackingLink = z.infer<typeof TrackingLinkSchema>;
export const CartSchema = createInsertSchema(carts);
export type Cart = z.infer<typeof CartSchema>;
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
