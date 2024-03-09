import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core"

import type { Image } from "../validators/common"
import { carts } from "./cart"
import { discounts } from "./discount"
import { orders } from "./order"
import { productVariants } from "./product-variant"

export const cartItems = pgTable(
  "cart_items",
  {
    id: varchar("id").notNull(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    discountable: boolean("discountable").default(true),
    cartId: varchar("cartId")
      .notNull()
      .references(() => carts.id, {
        onDelete: "cascade",
      }),
    description: varchar("description"),
    discountTotal: integer("discountTotal"),
    hasShipping: boolean("hasShipping").default(true),
    orderId: varchar("orderId"),
    quantity: integer("quantity").notNull(),
    refundable: boolean("refundable"),
    subtotal: integer("subtotal"),
    taxTotal: integer("taxTotal"),
    thumbnail: json("thumbnail").$type<Image>(),
    title: varchar("title"),
    total: integer("total").notNull(),
    unitPrice: integer("unitPrice").notNull(),
    variantId: varchar("variantШd")
      .notNull()
      .references(() => productVariants.id, {
        onDelete: "cascade",
      }),
    version: integer("version").notNull().default(0),
    available: boolean("available").default(true),
    currencyCode: varchar("currencyCode").notNull(),
  },
  (cartItems) => ({
    cartIdIndex: index("cartIdIndex").on(cartItems.cartId),
    orderIdIndex4: index("orderIdIndex4").on(cartItems.orderId),
    pk: primaryKey(cartItems.variantId, cartItems.id),
  }),
)
export const cartItemsRelations = relations(cartItems, ({ one, many }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  order: one(orders, {
    fields: [cartItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
  adjustments: many(cartItemAdjustments),
}))
export const cartItemAdjustments = pgTable(
  "cart_item_adjustments",
  {
    id: varchar("id").notNull().primaryKey(),
    amount: integer("amount").notNull(),
    description: varchar("description"),
    discountId: varchar("discountId"),
    itemId: varchar("itemId").notNull(),
  },
  (cartItemAdjustment) => ({
    discountIdIndex: index("discountIdIndex").on(cartItemAdjustment.discountId),
    itemIdIndex: index("itemIdIndex").on(cartItemAdjustment.itemId),
  }),
)
export const cartItemAdjustmentsRelations = relations(
  cartItemAdjustments,
  ({ one }) => ({
    discount: one(discounts, {
      fields: [cartItemAdjustments.discountId],
      references: [discounts.id],
    }),
    item: one(cartItems, {
      fields: [cartItemAdjustments.itemId],
      references: [cartItems.id],
    }),
  }),
)
