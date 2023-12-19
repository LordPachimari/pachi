import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import {
  swapFulfillmentStatus,
  swapPaymentStatus
} from "../validators/common";
import { addresses } from "./address";
import { carts } from "./cart";
import { fulfillments } from "./fulfillment";
import { orders } from "./order";
import { payments } from "./payment";
import { returns } from "./return";
import { shippingMethods } from "./shipping-method";
import { cartItems } from "./cart-item";

export const swaps = pgTable(
  "swaps",
  {
    id: varchar("id").notNull().primaryKey(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    allowBackorder: boolean("allowBackorder").default(false),
    canceledAt: varchar("canceledAt"),
    cartId: varchar("cartId"),
    confirmedAt: varchar("confirmedAt"),
    difference_due: integer("difference_due"),
    fulfillmentStatus: text("fulfillmentStatus", {
      enum: swapFulfillmentStatus,
    }),
    idempotencyKey: varchar("idempotencyKey"),
    notificationOff: boolean("notificationOff"),
    orderId: varchar("orderId"),
    paymentId: varchar("paymentId"),
    paymentStatus: text("paymentStatus", { enum: swapPaymentStatus }),
    returnId: varchar("returnId"),
    shippingAddressId: varchar("shippingAddressId"),
    version: integer("version").notNull().default(0),
  },
  (t) => ({
    cartIdIndex2: index("cartIdIndex2").on(t.cartId),
    orderIdIndex2: index("orderIdIndex2").on(t.orderId),
    paymentIdIndex: index("paymentIdIndex").on(t.paymentId),
    returnIdIndex: index("returnIdIndex").on(t.returnId),
    shippingAddressIdIndex: index("shippingAddressIdIndex").on(
      t.shippingAddressId,
    ),
  }),
);
export const swapsRelations = relations(swaps, ({ one, many }) => ({
  cart: one(carts, {
    fields: [swaps.cartId],
    references: [carts.id],
  }),
  order: one(orders, {
    fields: [swaps.orderId],
    references: [orders.id],
  }),
  payment: one(payments, {
    fields: [swaps.paymentId],
    references: [payments.id],
  }),
  returnOrder: one(returns, {
    fields: [swaps.returnId],
    references: [returns.id],
  }),
  shippingAddress: one(addresses, {
    fields: [swaps.shippingAddressId],
    references: [addresses.id],
  }),
  additionalItems: many(cartItems),
  fulfillments: many(fulfillments),
  shippingMethods: many(shippingMethods),
}));
