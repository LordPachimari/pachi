import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { products_to_tax_rates } from "./product";
import { product_types_to_tax_rates } from "./product-type";
import { regions } from "./region";
import { shipping_options_to_tax_rates } from "./shipping-option";

export const tax_rates = pgTable(
  "tax_rates",
  {
    id: varchar("id").notNull().primaryKey(),
    created_at: varchar("created_at"),
    updated_at: varchar("updated_at"),
    name: varchar("name").notNull(),
    rate: integer("rate"),
    region_id: varchar("region_id"),
    version: integer("version").notNull().default(0),
    code: varchar("code").notNull(),
  },
  (t) => ({
    region_id_index: index("region_id_index").on(t.region_id),
  }),
);
export const tax_ratesRelations = relations(tax_rates, ({ one, many }) => ({
  region: one(regions, {
    fields: [tax_rates.region_id],
    references: [regions.id],
  }),
  products: many(products_to_tax_rates),
  product_types: many(product_types_to_tax_rates),
  shipping_options: many(shipping_options_to_tax_rates),
}));
