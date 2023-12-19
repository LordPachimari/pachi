import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { cartItems } from "./cart-item";
import { returns } from "./return";
import { returnReasons } from "./return-reason";

export const returnItems = pgTable(
  "returnItems",
  {
    itemId: varchar("itemId").notNull().primaryKey(),
    isRequested: boolean("isRequested").default(true),
    note: varchar("note"),
    quantity: integer("quantity"),
    reasonId: varchar("reasonId"),
    receivedQuantity: integer("receivedQuantity"),
    requestedQuantity: integer("requestedQuantity"),
    returnId: varchar("returnId"),
    version: integer("version").notNull().default(0),
  },
  (t) => ({
    returnIdIndex1: index("returnIdIndex1").on(t.returnId),
    reasonIdIndex: index("reasonIdIndex").on(t.reasonId),
    itemIdIndex: index("itemIdIndex").on(t.itemId),
  }),
);
export const ReturnItemRelations = relations(returnItems, ({ one }) => ({
  reason: one(returnReasons, {
    fields: [returnItems.reasonId],
    references: [returnReasons.id],
  }),
  return_order: one(returns, {
    fields: [returnItems.returnId],
    references: [returns.id],
  }),
  item: one(cartItems, {
    fields: [returnItems.itemId],
    references: [cartItems.id],
  }),
}));
