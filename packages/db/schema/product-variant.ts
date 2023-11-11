import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import type { Image } from "../validators/common";
import { money_amount } from "./money-amount";
import { products } from "./product";
import { product_option_values } from "./product-option-value";

export const product_variants = pgTable(
  "product_variants",
  {
    id: varchar("id").notNull().primaryKey(),
    barcode: varchar("barcode"),
    created_at: varchar("created_at"),
    updated_at: varchar("updated_at"),
    ean: varchar("ean"),
    height: integer("height"),
    hs_code: varchar("hs_code"),
    inventory_quantity: integer("inventory_quantity").notNull().default(0),
    length: integer("length"),
    material: varchar("material"),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    mid_code: varchar("mid_code"),
    origin_country: text("origin_country"),
    product_id: varchar("product_id")
      .references(() => products.id, {
        onDelete: "cascade",
      })
      .notNull(),
    sku: varchar("sku"),
    title: varchar("title"),
    upc: varchar("upc"),
    weight: integer("weight"),
    width: integer("width"),
    images: json("images").$type<Image[]>(),
    version: integer("version").notNull().default(0),
    allow_backorder: boolean("allow_backorder").default(false),
  },
  (product_variant) => ({
    product_id_index: index("product_id_index").on(product_variant.product_id),
  }),
);
export const product_variant_relations = relations(
  product_variants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [product_variants.product_id],
      references: [products.id],
      relationName: "product.variants",
    }),
    prices: many(money_amount),
    options: many(product_option_values),
  }),
);
