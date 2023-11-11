import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { currencies } from "./currency";
import { price_lists } from "./price-list";
import { product_variants } from "./product-variant";

export const money_amount = pgTable(
  "money_amount",
  {
    id: varchar("id").notNull().primaryKey(),
    amount: integer("amount").notNull(),
    created_at: varchar("created_at"),
    currency_code: varchar("currency_code")
      .notNull()
      .references(() => currencies.code),
    max_quantity: integer("max_quantity"),
    min_quantity: integer("min_quantity"),
    price_list_id: varchar("price_list_id").references(() => price_lists.id, {
      onDelete: "cascade",
    }),
    variant_id: varchar("variant_id")
      .notNull()
      .references(() => product_variants.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(0),
  },
  (money_amount) => ({
    price_list_id_index: index("price_list_id_index").on(
      money_amount.price_list_id,
    ),
    variant_id_index: index("variant_id_index").on(money_amount.variant_id),
    currency_code_index: index("currency_code_index").on(
      money_amount.currency_code,
    ),
  }),
);
export const money_amount_relations = relations(money_amount, ({ one }) => ({
  price_list: one(price_lists, {
    fields: [money_amount.price_list_id],
    references: [price_lists.id],
  }),
  currency: one(currencies, {
    fields: [money_amount.currency_code],
    references: [currencies.code],
  }),
  variant: one(product_variants, {
    fields: [money_amount.variant_id],
    references: [product_variants.id],
  }),
}));
