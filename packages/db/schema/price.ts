import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { currencies } from "./currency";
import { priceLists } from "./price-list";
import { productVariants } from "./product-variant";

export const prices = pgTable(
  "prices",
  {
    id: varchar("id").notNull().primaryKey(),
    amount: integer("amount").notNull(),
    createdAt: varchar("createdAt"),
    currencyCode: varchar("currencyCode")
      .notNull()
      .references(() => currencies.code),
    maxQuantity: integer("maxQuantity"),
    minQuantity: integer("minQuantity"),
    priceListId: varchar("priceListId").references(() => priceLists.id, {
      onDelete: "cascade",
    }),
    variantId: varchar("variantId")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(0),
  },
  (price) => ({
    priceListIdIndex: index("priceListIdIndex").on(price.priceListId),
    variantIdIndex: index("variantIdIndex").on(price.variantId),
    currencyCodeIndex: index("currencyCodeIndex").on(price.currencyCode),
  }),
);
export const pricesRelations = relations(prices, ({ one }) => ({
  priceLists: one(priceLists, {
    fields: [prices.priceListId],
    references: [priceLists.id],
  }),
  currency: one(currencies, {
    fields: [prices.currencyCode],
    references: [currencies.code],
  }),
  variant: one(productVariants, {
    fields: [prices.variantId],
    references: [productVariants.id],
  }),
}));
