import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core"

import {
  fulfillmentStatus,
  orderStatus,
  paymentStatus,
} from "../validators/common"
import { addresses } from "./address"
import { carts } from "./cart"
import { cartItems } from "./cart-item"
import { currencies } from "./currency"
import { discounts } from "./discount"
import { fulfillments } from "./fulfillment"
import { payments } from "./payment"
import { refunds } from "./refund"
import { regions } from "./region"
import { returns } from "./return"
import { shippingMethods } from "./shipping-method"
import { users } from "./user"

export const orders = pgTable(
  "orders",
  {
    id: varchar("id").notNull().primaryKey(),
    billingAddressId: varchar("billingAddressId"),
    canceledAt: varchar("canceledAt"),
    cartId: varchar("cartId"),
    createdAt: varchar("createdAt").notNull(),
    currencyCode: varchar("currencyCode").notNull(),
    customerId: varchar("customerId"),
    discountTotal: integer("discountTotal").notNull().default(0),
    // .default(0),
    displayId: integer("displayId"),
    draftOrderId: varchar("draftOrderId"),
    email: varchar("email"),
    externalId: varchar("externalId"),
    fulfillmentStatus: varchar("fulfillmentStatus", {
      enum: fulfillmentStatus,
    })
      .notNull()
      .default("notFulfilled"),
    idempotencyKey: varchar("idempotencyKey"),
    notificationOff: boolean("notificationOff"),
    paidTotal: integer("paidTotal").notNull(),
    paymentStatus: text("paymentStatus", { enum: paymentStatus })
      .default("awaiting")
      .notNull(),
    refundableAmount: integer("refundableAmount"),
    refundedTotal: integer("refundedTotal").notNull().default(0),
    regionId: varchar("regionId"),
    salesChannelId: varchar("salesChannelId"),
    shippingAddressId: varchar("shippingAddressId"),
    shippingTotal: integer("shippingTotal").notNull(),
    status: varchar("status", { enum: orderStatus }).notNull(),
    subtotal: integer("subtotal").notNull(),
    taxRate: integer("taxRate"),
    taxTotal: integer("taxTotal").notNull(),
    total: integer("total").notNull(),
    updatedAt: varchar("updatedAt"),
    version: integer("version").notNull().default(0),
  },
  (order) => ({
    billingAddressIdIndex: index("billingAddressIdIndex").on(
      order.billingAddressId,
    ),
    cartIdIndex: index("cartIdIndex").on(order.cartId),
    currencyCodeIndex: index("currencyCodeIndex").on(order.currencyCode),
    customerIdIndex: index("customerIdIndex").on(order.customerId),
    draftOrderIdIndex: index("draftOrderIdIndex").on(order.draftOrderId),
    emailIndex: index("emailIndex").on(order.email),
    regionIdIndex: index("regionIdIndex").on(order.regionId),
    sales_channelIdIndex: index("sales_channelIdIndex").on(
      order.salesChannelId,
    ),
    shipping_addressIdIndex: index("shipping_addressIdIndex").on(
      order.shippingAddressId,
    ),
  }),
)
export const OrderRelations = relations(orders, ({ one, many }) => ({
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  cart: one(carts, {
    fields: [orders.cartId],
    references: [carts.id],
  }),
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  // draft_order: one(DraftOrder, {
  //   fields: [Order.draft_order_id],
  //   references: [DraftOrder.id],
  // }),
  currency: one(currencies, {
    fields: [orders.currencyCode],
    references: [currencies.code],
  }),
  region: one(regions, {
    fields: [orders.regionId],
    references: [regions.id],
  }),
  // sales_channel: one(SalesChannel, {
  //   fields: [Order.sales_channel_id],
  //   references: [SalesChannel.id],
  // }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  discounts: many(ordersToDiscounts),
  shippingMethods: many(shippingMethods),
  payments: many(payments),
  fulfillments: many(fulfillments),
  returns: many(returns),
  // claims: many(ClaimOrder),
  refunds: many(refunds),
  items: many(cartItems),
  // gift_card_transactions: many(GiftCardTransaction),
}))
export const ordersToDiscounts = pgTable("orders_to_discounts", {
  discountId: varchar("discountId")
    .notNull()
    .references(() => discounts.id),
  orderId: varchar("orderId")
    .notNull()
    .references(() => orders.id),
})
export const orderToDiscountsRelations = relations(
  ordersToDiscounts,
  ({ one }) => ({
    discount: one(discounts, {
      fields: [ordersToDiscounts.discountId],
      references: [discounts.id],
    }),
    order: one(orders, {
      fields: [ordersToDiscounts.orderId],
      references: [orders.id],
    }),
  }),
)
