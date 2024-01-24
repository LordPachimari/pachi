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

export const returns = pgTable(
  "returns",
  {
    id: varchar("id").notNull().primaryKey(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    idempotencyKey: varchar("idempotencyKey"),
    orderId: varchar("orderId"),
    receivedAt: varchar("receivedAt"),
    refundAmount: integer("refundAmount"),
    shippingData: json("shippingData").$type<Record<string, unknown>>(),
    shippingMethodId: varchar("shippingMethodId"),
    status: varchar("status", { enum: returnStatus }),
    version: integer("version").notNull().default(0),
  },
  (t) => ({
    orderIdIndex8: index("orderIdIndex8").on(t.orderId),
    shippingMethodIdIndex: index("shippingMethodIdIndex").on(
      t.shippingMethodId,
    ),
  }),
);
export const returnsRelations = relations(returns, ({ one, many }) => ({
  order: one(orders, {
    fields: [returns.orderId],
    references: [orders.id],
  }),
  shippingMethod: one(shippingMethods, {
    fields: [returns.shippingMethodId],
    references: [shippingMethods.id],
  }),
  items: many(returnItems),
}));
