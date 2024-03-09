import { relations } from "drizzle-orm"
import { index, integer, json, pgTable, varchar } from "drizzle-orm/pg-core"

import { carts } from "./cart"
import { currencies } from "./currency"
import { orders } from "./order"
import { paymentProviders } from "./payment-provider"

export const payments = pgTable(
  "payments",
  {
    id: varchar("id").notNull().primaryKey(),
    amount: integer("amount").notNull(),
    amountRefunded: integer("amountRefunded"),
    canceledAt: varchar("canceledAt"),
    capturedAt: varchar("capturedAt"),
    cartId: varchar("cartId"),
    createdAt: varchar("createdAt"),
    currencyCode: varchar("currencyCode"),
    data: json("data").$type<Record<string, unknown>>(),
    idempotencyKey: varchar("idempotencyKey"),
    orderId: varchar("orderId"),
    providerId: varchar("providerId"),
    updatedAt: varchar("updatedAt"),
    version: integer("version").notNull().default(0),
  },
  (payment) => ({
    cartIdIndex: index("cartIdIndex").on(payment.cartId),
    currencyCodeIndex: index("currencyCodeIndex").on(payment.currencyCode),
    orderIdIndex_6: index("orderIdIndex_6").on(payment.orderId),
    providerIdIndex: index("providerIdIndex").on(payment.providerId),
  }),
)
export const PaymentRelations = relations(payments, ({ one }) => ({
  cart: one(carts, {
    fields: [payments.cartId],
    references: [carts.id],
  }),
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  provider: one(paymentProviders, {
    fields: [payments.providerId],
    references: [paymentProviders.id],
  }),
  currency: one(currencies, {
    fields: [payments.currencyCode],
    references: [currencies.code],
  }),
}))
