import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import type { Image } from "../validators/common";
import { product_collections } from "./product-collection";
import { product_options } from "./product-option";
import { product_tags } from "./product-tag";
import { product_types } from "./product-type";
import { product_variants } from "./product-variant";
import { sales_channels } from "./sales-channel";
import { stores } from "./store";
import { tax_rates } from "./tax-rate";
import { users } from "./user";

export const products = pgTable(
  "products",
  {
    id: varchar("id").notNull().primaryKey(),
    collection_id: varchar("collection_id").references(
      () => product_collections.id,
    ),
    created_at: varchar("created_at").notNull(),
    description: text("description"),
    version: integer("version").notNull().default(0),
    updated_at: varchar("updated_at"),
    discountable: boolean("discountable").notNull().default(true),
    handle: varchar("handle"),
    is_giftcard: boolean("is_giftcard").default(false),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    origin_country: varchar("origin_country"),
    status: text("status", {
      enum: ["draft", "proposed", "published", "rejected"],
    }).default("draft"),
    thumbnail: json("thumbnail").$type<Image>(),
    title: varchar("title"),
    type_id: varchar("type_id"),
    updated_by: varchar("updated_by"),
    default_variant_id: varchar("default_variant_id"),
    store_id: varchar("store_id").notNull(),
    unauthenticated: boolean("unauthenticated").default(false),
  },
  (product) => ({
    collection_id_index: index("collection_id_index").on(product.collection_id),
    type_id_index: index("type_id_index").on(product.type_id),
    handle_index: uniqueIndex("handle_index").on(product.handle),
    status_index: index("status_index").on(product.status),
    default_variant_id_index: index("default_variant_id_index").on(
      product.default_variant_id,
    ),
    store_id_index: index("store_id_index").on(product.store_id),
  }),
);
export const products_relations = relations(products, ({ one, many }) => ({
  collection: one(product_collections, {
    fields: [products.collection_id],
    references: [product_collections.id],
  }),
  type: one(product_types, {
    fields: [products.type_id],
    references: [product_types.id],
  }),
  variants: many(product_variants, { relationName: "product.variants" }),
  options: many(product_options),
  tags: many(products_to_tags),
  sales_channels: many(products_to_sales_channels),
  tax_rates: many(products_to_tax_rates),
  store: one(stores, {
    fields: [products.store_id],
    references: [stores.id],
  }),
}));
export const products_to_sales_channels = pgTable(
  "products_to_sales_channels",
  {
    id: varchar("id"),
    product_id: varchar("product_id")
      .notNull()
      .references(() => products.id),
    sales_channel_id: varchar("sales_channel_id")
      .notNull()
      .references(() => sales_channels.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.product_id, t.sales_channel_id),
  }),
);
export const products_to_sales_channels_relations = relations(
  products_to_sales_channels,
  ({ one }) => ({
    product: one(products, {
      fields: [products_to_sales_channels.product_id],
      references: [products.id],
    }),
    sales_channel: one(sales_channels, {
      fields: [products_to_sales_channels.sales_channel_id],
      references: [sales_channels.id],
    }),
    seller: one(users, {
      fields: [products_to_sales_channels.sales_channel_id],
      references: [users.id],
    }),
  }),
);

export const products_to_tax_rates = pgTable(
  "products_to_tax_rates",
  {
    id: varchar("id"),
    product_id: varchar("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    rate_id: varchar("rate_id")
      .notNull()
      .references(() => tax_rates.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.product_id, t.rate_id),
  }),
);

export const products_to_tax_rates_relations = relations(
  products_to_tax_rates,
  ({ one }) => ({
    product: one(products, {
      fields: [products_to_tax_rates.product_id],
      references: [products.id],
    }),
    rate: one(tax_rates, {
      fields: [products_to_tax_rates.rate_id],
      references: [tax_rates.id],
    }),
  }),
);
export const products_to_tags = pgTable(
  "products_to_tags",
  {
    id: varchar("id"),
    product_id: varchar("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tag_id: varchar("tag_id")
      .notNull()
      .references(() => product_tags.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.product_id, t.tag_id),
  }),
);
export const product_to_tags_relations = relations(
  products_to_tags,
  ({ one }) => ({
    product: one(products, {
      fields: [products_to_tags.product_id],
      references: [products.id],
    }),
    tag: one(product_tags, {
      fields: [products_to_tags.tag_id],
      references: [product_tags.id],
    }),
  }),
);
