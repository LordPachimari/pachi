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

import type { Image } from "../validators/common";
import { carts } from "./cart";
import { discounts } from "./discount";
import { orders } from "./order";
import { productVariants } from "./product-variant";
import { swaps } from "./swap";

export const cartItems = pgTable(
  "cartItems",
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
    claimOrderId: varchar("claimOrderId"),
    description: varchar("description"),
    discountTotal: integer("discountTotal"),
    fulfilledQuantity: integer("fulfilledQuantity"),
    giftCardTotal: integer("giftCardTotal"),
    hasShipping: boolean("hasShipping").default(true),
    // includes_tax: boolean("includes_tax").notNull().default(false),
    isGiftcard: boolean("isGiftcard").default(false),
    isReturn: boolean("isReturn").default(false),
    orderId: varchar("orderId"),
    orderEditId: varchar("orderEditId"),
    originalItemId: varchar("originalItemId"),
    originalTotal: integer("originalTotal"),
    quantity: integer("quantity").notNull(),
    refundable: boolean("refundable"),
    returnedQuantity: integer("returnedQuantity"),
    shippedQuantity: integer("shippedQuantity"),
    subtotal: integer("subtotal"),
    swapId: varchar("swapId"),
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
    purchasable: boolean("purchasable").default(true),
    currencyCode: varchar("currencyCode").notNull(),
  },
  (cartItems) => ({
    cartIdIndex: index("cartIdIndex").on(cartItems.cartId),
    claimOrderIdIndex: index("claimOrderIdIndex").on(cartItems.claimOrderId),
    orderIdIndex4: index("orderIdIndex4").on(cartItems.orderId),
    orderEditIdIndex: index("orderEditIdIndex").on(cartItems.orderEditId),
    originalItemIdIndex: index("originalItemIdIndex").on(
      cartItems.originalItemId,
    ),
    swapIdIndex2: index("swapIdIndex2").on(cartItems.swapId),
    pk: primaryKey(cartItems.variantId, cartItems.id),
  }),
);
export const cartItemsRelations = relations(cartItems, ({ one, many }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  // claim_order: one(claim, {
  //   fields: [CartItem.claim_order_id],
  //   references: [claim.id],
  // }),
  order: one(orders, {
    fields: [cartItems.orderId],
    references: [orders.id],
  }),
  // order_edit: one(OrderEdit, {
  //   fields: [CartItem.order_edit_id],
  //   references: [OrderEdit.id],
  // }),
  originalItem: one(cartItems, {
    fields: [cartItems.originalItemId],
    references: [cartItems.id],
  }),
  swap: one(swaps, {
    fields: [cartItems.swapId],
    references: [swaps.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
  adjustments: many(cartItemAdjustments),
  // tax_lines: many(CartItemTaxLine),
}));
export const cartItemAdjustments = pgTable(
  "cartItemAdjustments",
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
);
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
);
