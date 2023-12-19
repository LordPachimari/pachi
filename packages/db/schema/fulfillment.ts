import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

import { cartItems } from "./cart-item";
import { fulfillmentProviders } from "./fulfillment-provider";
import { orders } from "./order";
import { swaps } from "./swap";
import { trackingLinks } from "./tracking-link";

export const fulfillments = pgTable(
  "fulfillments",
  {
    id: varchar("id").notNull().primaryKey(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    canceledAt: varchar("canceledAt"),
    claimOrderId: varchar("claimOrderId"),
    data: json("data").$type<Record<string, unknown>>(),
    idempotencyKey: varchar("idempotencyKey"),
    notificationOff: boolean("notificationOff"),
    orderId: varchar("orderId"),
    providerId: varchar("providerId").notNull(),
    locationId: varchar("locationId").notNull(),
    shippedAt: varchar("shippedAt"),
    swapId: varchar("swapId"),
    trackingNumbers: json("trackingNumbers"),
    version: integer("version").notNull().default(0),
  },
  (fulfillment) => ({
    claimOrderIdIndex: index("claimOrderIdIndex").on(fulfillment.claimOrderId),
    orderIdIndex_3: index("orderIdIndex_3").on(fulfillment.orderId),
    providerIdIndex: index("providerIdIndex").on(fulfillment.providerId),
    swapIdIndex: index("swapIdIndex").on(fulfillment.swapId),
  }),
);
export const fulfillmentRelations = relations(
  fulfillments,
  ({ one, many }) => ({
    // claim_order: one(cl, {
    //   fields: [fulfillments.claim_order_id],
    //   references: [cl.id],
    // }),
    order: one(orders, {
      fields: [fulfillments.orderId],
      references: [orders.id],
    }),
    provider: one(fulfillmentProviders, {
      fields: [fulfillments.providerId],
      references: [fulfillmentProviders.id],
    }),
    items: many(fulfillmentItems),
    trackingLinks: many(trackingLinks),
    swap: one(swaps, {
      fields: [fulfillments.swapId],
      references: [swaps.id],
    }),
  }),
);

export const fulfillmentItems = pgTable(
  "fulfillmentItems",
  {
    itemId: varchar("itemId").notNull(),
    fulfillmentId: varchar("fulfillmentId").notNull(),
    quantity: integer("quantity"),
  },
  (t) => ({
    pk: primaryKey(t.itemId, t.fulfillmentId),
  }),
);
export const fulfillmentItemsRelations = relations(
  fulfillmentItems,
  ({ one }) => ({
    item: one(cartItems, {
      fields: [fulfillmentItems.itemId],
      references: [cartItems.id],
    }),
    fulfillment: one(fulfillments, {
      fields: [fulfillmentItems.fulfillmentId],
      references: [fulfillments.id],
    }),
  }),
);
