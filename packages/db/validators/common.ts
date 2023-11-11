import { enumType, number, object, string, type Output } from "valibot";

export const ImageSchema = object({
  id: string(),
  name: string(),
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

export const fulfillment_status = [
  "fulfilled",
  "not_fulfilled",
  "partially_fulfilled",
  "partially_returned",
  "partially_shipped",
  "requires_action",
  "returned",
  "shipped",
] as const;
export const FulfillmentStatusSchema = enumType(fulfillment_status);
export type FulfillmentStatus = Output<typeof FulfillmentStatusSchema>;

export const swap_fulfillment_status = [
  "canceled",
  "fulfilled",
  "not_fulfilled",
  "partially_shipped",
  "requires_action",

  "shipped",
] as const;

export const payment_status = [
  "not_paid",
  "awaiting",
  "captured",
  "partially_refunded",
  "refunded",
  "canceled",
  "requires_action",
] as const;
export const PaymentStatusSchema = enumType(payment_status);
export type PaymentStatus = Output<typeof PaymentStatusSchema>;

export const swap_payment_status = [
  "awaiting",
  "canceled",
  "captured",
  "confirmed",
  "difference_refunded",
  "not_paid",
  "partially_refunded",
  "refunded",
  "requires_action",
] as const;

export const order_status = [
  "archived",
  "canceled",
  "completed",
  "pending",
  "requires_action",
] as const;

export const OrderStatusSchema = enumType(order_status);
export type OrderStatus = Output<typeof OrderStatusSchema>;

export const order_edit_status = [
  "canceled",
  "confirmed",
  "created",
  "declined",
  "requested",
] as const;

export const payment_collection_status = [
  "authorized",
  "awaiting",
  "canceled",
  "not_paid",
  "partially_authorized",
] as const;

export const return_status = [
  "canceled",
  "received",
  "requested",
  "requires_action",
] as const;

export const productStatus = [
  "draft",
  "published",
  "proposed",
  "rejected",
] as const;
export const ProductStatusSchema = enumType(productStatus);
export type ProductStatus = Output<typeof ProductStatusSchema>;

export const discount_type = [
  "off_products",
  "off_order",
  "buy_x_get_y",
] as const;
export const DiscountTypeSchema = enumType(discount_type);
export type DiscountType = Output<typeof DiscountTypeSchema>;

export const CartTypeSchema = enumType([
  "claim",
  "default",
  "draft_order",
  "payment_link",
  "swap",
]);
export type CartType = Output<typeof CartTypeSchema>;

export enum DiscountRuleType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  FREE_SHIPPING = "free_shipping",
}

export enum AllocationType {
  TOTAL = "total",
  ITEM = "item",
}
