import { z } from "zod";

export const ImageSchema = z.object({
  id: z.string(),
  altText: z.string(),
  order: z.number(),
  url: z.string(),
});

export const product_status = [
  "draft",
  "proposed",
  "published",
  "rejected",
] as const;
export type Image = z.infer<typeof ImageSchema>;
export const category = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Accessories",
  "Other",
] as const;

export const subcategory = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Accessories",
  "Other",
] as const;

export const fulfillmentStatus = [
  "fulfilled",
  "notFulfilled",
  "partiallyFulfilled",
  "partiallyReturned",
  "partiallyShipped",
  "requiresAction",
  "returned",
  "shipped",
] as const;
export const FulfillmentStatusSchema = z.enum(fulfillmentStatus);
export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>;

export const swapFulfillmentStatus = [
  "canceled",
  "fulfilled",
  "notFulfilled",
  "partiallyShipped",
  "requiresAction",

  "shipped",
] as const;

export const paymentStatus = [
  "notPaid",
  "awaiting",
  "captured",
  "partiallyRefunded",
  "refunded",
  "canceled",
  "requiresAction",
] as const;
export const PaymentStatusSchema = z.enum(paymentStatus);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const swapPaymentStatus = [
  "awaiting",
  "canceled",
  "captured",
  "confirmed",
  "differenceRefunded",
  "notPaid",
  "partiallyRefunded",
  "refunded",
  "requiresAction",
] as const;

export const orderStatus = [
  "archived",
  "canceled",
  "completed",
  "pending",
  "requiresAction",
] as const;

export const OrderStatusSchema = z.enum(orderStatus);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const orderEditStatus = [
  "canceled",
  "confirmed",
  "created",
  "declined",
  "requested",
] as const;

export const paymentCollectionStatus = [
  "authorized",
  "awaiting",
  "canceled",
  "notPaid",
  "partiallyAuthorized",
] as const;

export const returnStatus = [
  "canceled",
  "received",
  "requested",
  "requiresAction",
] as const;

export const productStatus = [
  "draft",
  "published",
  "proposed",
  "rejected",
] as const;
export const ProductStatusSchema = z.enum(productStatus);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const discountType = ["offProducts", "offOrder", "buyXGetY"] as const;
export const DiscountTypeSchema = z.enum(discountType);
export type DiscountType = z.infer<typeof DiscountTypeSchema>;

export const CartTypeSchema = z.enum([
  "claim",
  "default",
  "draftOrder",
  "paymentLink",
  "swap",
]);
export type CartType = z.infer<typeof CartTypeSchema>;

export enum DiscountRuleType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  FREE_SHIPPING = "freeShipping",
}

export enum AllocationType {
  TOTAL = "total",
  ITEM = "item",
}
