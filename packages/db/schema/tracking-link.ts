import { relations } from "drizzle-orm"
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core"

import { fulfillments } from "./fulfillment"

export const trackingLinks = pgTable(
  "tracking_links",
  {
    id: varchar("id").notNull().primaryKey(),
    fulfillmentId: varchar("fulfillmentId"),
    idempotencyKey: varchar("idempotencyKey"),
    createdAt: varchar("createdAt"),
    trackingNumber: varchar("trackingNumber"),
    url: varchar("url"),
    version: integer("version").notNull().default(0),
  },
  (t) => ({
    fulfillmentIdIndex: index("fulfillmentIdIndex").on(t.fulfillmentId),
  }),
)
export const trackingLinksRelations = relations(trackingLinks, ({ one }) => ({
  fulfillment: one(fulfillments, {
    fields: [trackingLinks.fulfillmentId],
    references: [fulfillments.id],
  }),
}))
