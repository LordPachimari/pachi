import { enumType, number, object, string, type Output } from "valibot";

export const ImageSchema = object({
  id: string(),
  altText: string(),
  order: number(),
  url: string(),
});

export const product_status = [
  "draft",
  "proposed",
  "published",
  "rejected",
] as const;
export type Image = Output<typeof ImageSchema>;
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
export const FulfillmentStatusSchema = enumType(fulfillmentStatus);
export type FulfillmentStatus = Output<typeof FulfillmentStatusSchema>;

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
export const PaymentStatusSchema = enumType(paymentStatus);
export type PaymentStatus = Output<typeof PaymentStatusSchema>;

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

export const OrderStatusSchema = enumType(orderStatus);
export type OrderStatus = Output<typeof OrderStatusSchema>;

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
export const ProductStatusSchema = enumType(productStatus);
export type ProductStatus = Output<typeof ProductStatusSchema>;

export const discountType = ["offProducts", "offOrder", "buyXGetY"] as const;
export const DiscountTypeSchema = enumType(discountType);
export type DiscountType = Output<typeof DiscountTypeSchema>;

export const CartTypeSchema = enumType([
  "claim",
  "default",
  "draftOrder",
  "paymentLink",
  "swap",
]);
export type CartType = Output<typeof CartTypeSchema>;

export enum DiscountRuleType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  FREE_SHIPPING = "freeShipping",
}

export enum AllocationType {
  TOTAL = "total",
  ITEM = "item",
}
