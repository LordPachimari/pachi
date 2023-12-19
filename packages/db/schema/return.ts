import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";

import { returnStatus } from "../validators/common";
import { orders } from "./order";
import { returnItems } from "./return-item";
import { shippingMethods } from "./shipping-method";
import { swaps } from "./swap";

export const returns = pgTable(
  "returns",
  {
    id: varchar("id").notNull().primaryKey(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    claimOrderId: varchar("claimOrderId"),
    idempotencyKey: varchar("idempotencyKey"),
    notificationOff: boolean("notificationOff"),
    orderId: varchar("orderId"),
    receivedAt: varchar("receivedAt"),
    refundAmount: integer("refundAmount"),
    shippingData: json("shippingData").$type<Record<string, unknown>>(),
    shippingMethodId: varchar("shippingMethodId"),
    status: varchar("status", { enum: returnStatus }),
    swapId: varchar("swapId"),
    version: integer("version").notNull().default(0),
  },
  (t) => ({
    orderIdIndex8: index("orderIdIndex8").on(t.orderId),
    claimOrderIdIndex: index("claimOrderIdIndex").on(t.claimOrderId),
    shippingMethodIdIndex: index("shippingMethodIdIndex").on(
      t.shippingMethodId,
    ),
    swapIdIndex4: index("swapIdIndex4").on(t.swapId),
  }),
);
export const returnsRelations = relations(returns, ({ one, many }) => ({
  // claimOrder: one(orders, {
  //   fields: [returns.claimOrderId],
  //   references: [orders.id],
  // }),
  order: one(orders, {
    fields: [returns.orderId],
    references: [orders.id],
  }),
  shippingMethod: one(shippingMethods, {
    fields: [returns.shippingMethodId],
    references: [shippingMethods.id],
  }),
  swap: one(swaps, {
    fields: [returns.swapId],
    references: [swaps.id],
  }),
  items: many(returnItems),
}));
