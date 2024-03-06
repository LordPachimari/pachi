import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core'

import { carts } from './cart'
import { orders } from './order'
import { returns } from './return'
import { shippingOptions } from './shipping-option'

export const shippingMethods = pgTable(
  'shipping_methods',
  {
    id: varchar('id').notNull().primaryKey(),
    cartId: varchar('cartId'),
    claimOrderId: varchar('claimOrderId'),
    data: json('data').$type<Record<string, unknown>>(),
    includesTax: boolean('includesTax').notNull().default(false),
    orderId: varchar('orderId'),
    price: integer('price').notNull(),
    returnId: varchar('returnId'),
    shippingOptionId: varchar('shippingOptionId').notNull(),
    subtotal: integer('subtotal'),
    taxTotal: integer('taxTotal'),
    total: integer('total'),

    version: integer('version').notNull().default(0),
  },
  (t) => ({
    cartIdIndex1: index('cartIdIndex1').on(t.cartId),
    claimOrderIdIndex: index('claimOrderIdIndex').on(t.claimOrderId),
    orderIdIndex1: index('orderIdIndex1').on(t.orderId),
    returnIdIndex: index('returnIdIndex').on(t.returnId),
    shippingOptionIdIndex: index('shipping_optionIdIndex').on(
      t.shippingOptionId,
    ),
  }),
)
export const ShippingMethodRelations = relations(
  shippingMethods,
  ({ one }) => ({
    cart: one(carts, {
      fields: [shippingMethods.cartId],
      references: [carts.id],
    }),
    // claimOrder: one(orders, {
    //   fields: [shippingMethods.claimOrderId],
    //   references: [orders.id],
    // }),
    order: one(orders, {
      fields: [shippingMethods.orderId],
      references: [orders.id],
    }),
    returnOrder: one(returns, {
      fields: [shippingMethods.returnId],
      references: [returns.id],
    }),
    shippingOption: one(shippingOptions, {
      fields: [shippingMethods.shippingOptionId],
      references: [shippingOptions.id],
    }),
    // tax_lines: many(ShippingMethodTaxLine),
  }),
)
