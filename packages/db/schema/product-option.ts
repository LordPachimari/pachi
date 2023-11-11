import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { products } from "./product";
import { product_option_values } from "./product-option-value";

export const product_options = pgTable(
  "product_options",
  {
    id: varchar("id").notNull().primaryKey(),
    product_id: varchar("product_id")
      .references(() => products.id, {
        onDelete: "cascade",
      })
      .notNull(),
    name: varchar("name"),
    version: integer("version").notNull().default(0),
  },
  (product_option) => ({
    product_id_index2: index("product_id_index2").on(product_option.product_id),
  }),
);
export const product_option_relations = relations(
  product_options,
  ({ one, many }) => ({
    product: one(products, {
      fields: [product_options.product_id],
      references: [products.id],
    }),
    values: many(product_option_values),
  }),
);
