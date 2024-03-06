import { relations } from 'drizzle-orm'
import { index, integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { orders } from './order'
import { payments } from './payment'

export const refunds = pgTable(
  'refunds',
  {
    id: varchar('id').notNull().primaryKey(),
    idempotencyKey: varchar('idempotencyKey'),
    amount: integer('amount'),
    note: varchar('note'),
    orderId: varchar('orderId'),
    paymentId: varchar('paymentId'),
    reason: varchar('reason'),
    updatedAt: varchar('updatedAt'),
    createdAt: varchar('createdAt'),
    version: integer('version').notNull().default(0),
  },
  (refund) => ({
    orderIdIndex7: index('orderIdIndex7').on(refund.orderId),
    paymentIdIndex: index('paymentIdIndex').on(refund.paymentId),
  }),
)
export const RefundRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id],
  }),
}))
