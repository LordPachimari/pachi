import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

import { tax_rates } from "./tax-rate";

export const product_types = pgTable("product_types", {
  id: varchar("id").notNull().primaryKey(),
  created_at: varchar("created_at"),
  value: varchar("value"),
  version: integer("version").notNull().default(0),
});
export const product_types_relations = relations(product_types, ({ many }) => ({
  tax_rates: many(product_types_to_tax_rates),
}));

export const product_types_to_tax_rates = pgTable(
  "product_types_to_tax_rates",
  {
    id: varchar("id"),
    product_type_id: varchar("product_type_id")
      .notNull()
      .references(() => product_types.id),
    rate_id: varchar("rate_id")
      .notNull()
      .references(() => tax_rates.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.product_type_id, t.rate_id),
  }),
);
export const product_types_to_tax_rates_relations = relations(
  product_types_to_tax_rates,
  ({ one }) => ({
    product_type: one(product_types, {
      fields: [product_types_to_tax_rates.product_type_id],
      references: [product_types.id],
    }),
    rate: one(tax_rates, {
      fields: [product_types_to_tax_rates.rate_id],
      references: [tax_rates.id],
    }),
  }),
);
