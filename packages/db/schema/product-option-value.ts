import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { product_options } from "./product-option";
import { product_variants } from "./product-variant";

export const product_option_values = pgTable(
  "product_option_values",
  {
    id: varchar("id").notNull().primaryKey(),
    variant_id: varchar("variant_id").references(() => product_variants.id),
    value: varchar("value").notNull(),
    option_id: varchar("option_id")
      .notNull()
      .references(() => product_options.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(0),
  },
  (product_option) => ({
    product_variant_id_index: index("product_variant_id_index").on(
      product_option.variant_id,
    ),
    option_id_index: index("option_id_index").on(product_option.option_id),
  }),
);
export const product_option_values_relations = relations(
  product_option_values,
  ({ one }) => ({
    variant: one(product_variants, {
      fields: [product_option_values.variant_id],
      references: [product_variants.id],
    }),
    option: one(product_options, {
      fields: [product_option_values.option_id],
      references: [product_options.id],
    }),
  }),
);
