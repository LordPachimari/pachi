import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core"

import { carts } from "./cart"
import { paymentProviders } from "./payment-provider"

export const paymentSessions = pgTable(
  "payment_sessions",
  {
    id: varchar("id").notNull().primaryKey(),
    amount: integer("amount"),
    cartId: varchar("cartId"),
    createdAt: varchar("createdAt"),
    data: json("data").$type<Record<string, unknown>>(),
    idempotencyKey: varchar("idempotencyKey"),
    isSelected: boolean("isSelected"),
    paymentAuthorizedAt: varchar("paymentAuthorizedAt"),
    providerId: varchar("providerId"),
    status: varchar("status"),
    updatedAt: varchar("updatedAt"),
    version: integer("version").notNull().default(0),
  },
  (paymentSession) => ({
    cartIdIndex: index("cartIdIndex").on(paymentSession.cartId),
    providerIdIndex: index("providerIdIndex").on(paymentSession.providerId),
  }),
)
export const paymentSessionsRelations = relations(
  paymentSessions,
  ({ one }) => ({
    cart: one(carts, {
      fields: [paymentSessions.cartId],
      references: [carts.id],
    }),
    provider: one(paymentProviders, {
      fields: [paymentSessions.providerId],
      references: [paymentProviders.id],
    }),
  }),
)
