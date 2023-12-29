import { relations } from "drizzle-orm";
import { index, integer, json, pgTable, varchar } from "drizzle-orm/pg-core";

import { addresses } from "./address";
import { cartItems } from "./cart-item";
import { discounts } from "./discount";
import { payments } from "./payment";
import { regions } from "./region";
import { users } from "./user";

export const carts = pgTable(
  "carts",
  {
    id: varchar("id").notNull().primaryKey(),
    billingAddressId: varchar("billingAddressId"),
    completedAt: varchar("completedAt"),
    context: json("context").$type<Record<string, unknown>>(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    customerId: varchar("customerId"),
    discountTotal: integer("discountTotal"),
    discountId: varchar("discountId"),
    email: varchar("email"),
    giftCardTaxTotal: integer("giftCardTaxTotal"),
    giftCardTotal: integer("giftCardTotal"),
    idempotencyKey: varchar("idempotencyKey"),
    itemTaxTotal: integer("itemTaxTotal"),
    paymentId: varchar("paymentId"),
    paymentAuthorizedAt: varchar("paymentAuthorizedAt"),
    refundableAmount: integer("refundableAmount"),
    refundedTotal: integer("refundedTotal"),
    regionId: varchar("regionId").notNull(),
    shippingAddressId: varchar("shippingAddressId"),
    shippingTaxTotal: integer("shippingTaxTotal"),
    shippingTotal: integer("shippingTotal"),
    subtotal: integer("subtotal"),
    taxTotal: integer("taxTotal"),
    total: integer("total"),
    totalQuantity: integer("totalQuantity"),
    type: varchar("type", {
      enum: ["claim", "default", "draft_order", "payment_link", "swap"],
    })
      .notNull()
      .default("default"),
    salesChannelId: varchar("salesChannelId"),
    currencyCode: varchar("currencyCode").notNull(),
    version: integer("version").default(0),
  },
  (cart) => ({
    billingAddressIdIndex1: index("billingAddressIdIndex1").on(
      cart.billingAddressId,
    ),
    shippingAddressIdIndex1: index("shippingAddressIdIndex1").on(
      cart.shippingAddressId,
    ),
    regionIdIndex1: index("regionIdIndex1").on(cart.regionId),
    customerIdIndex1: index("customerIdIndex1").on(cart.customerId),
    paymentIdIndex1: index("paymentIdIndex1").on(cart.paymentId),
    salesChannelIdIndex1: index("salesChannelIdIndex1").on(cart.salesChannelId),
  }),
);
export const cartsRelations = relations(carts, ({ one, many }) => ({
  billingAddress: one(addresses, {
    fields: [carts.billingAddressId],
    references: [addresses.id],
  }),
  shippingAddress: one(addresses, {
    fields: [carts.shippingAddressId],
    references: [addresses.id],
  }),
  region: one(regions, {
    fields: [carts.regionId],
    references: [regions.id],
  }),
  discount: one(discounts, {
    fields: [carts.discountId],
    references: [discounts.id],
  }),
  // gift_cards: many(CartToGiftCard),
  customer: one(users, {
    fields: [carts.customerId],
    references: [users.id],
  }),
  payment: one(payments, {
    fields: [carts.paymentId],
    references: [payments.id],
  }),
  paymentSessions: many(payments),
  items: many(cartItems),
  //   sales_channel: one(SalesChannel, {
  //     fields: [Cart.sales_channel_id],
  //     references: [SalesChannel.id],
  //   }),
}));
// export const carts_to_discounts = pgTable(
//   "carts_to_discounts",
//   {
//     cart_id: integer("cart_id")
//       .notNull()
//       .references(() => carts.id),
//     discount_id: integer("discount_id")
//       .notNull()
//       .references(() => discounts.id),
//   },
//   (t) => ({
//     pk: primaryKey(t.cart_id, t.discount_id),
//   }),
// );
// //Many to many relationship
// export const carts_to_discounts_relations = relations(
//   carts_to_discounts,
//   ({ one }) => ({
//     cart: one(carts, {
//       fields: [carts_to_discounts.cart_id],
//       references: [carts.id],
//     }),
//     discount: one(discounts, {
//       fields: [carts_to_discounts.discount_id],
//       references: [discounts.id],
//     }),
//   }),
// );
// export const CartToGiftCard = sqliteTable(
//   "cart_to_gift_card",
//   {
//     cart_id: integer("cart_id")
//       .notNull()
//       .references(() => Cart.id),
//     gift_card_id: integer("discount_id")
//       .notNull()
//       .references(() => GiftCard.id),
//   },
//   (t) => ({
//     pk: primaryKey(t.cart_id, t.gift_card_id),
//   }),
// );
// //Many to many relationship
// export const CartToGiftcardRelations = relations(
//   CartToDiscount,
//   ({ one, many }) => ({
//     cart: one(Cart, {
//       fields: [CartToDiscount.cart_id],
//       references: [Cart.id],
//     }),
//     discount: one(GiftCard, {
//       fields: [CartToDiscount.discount_id],
//       references: [GiftCard.id],
//     }),
//     items: many(CartItem),
//   }),
// );
