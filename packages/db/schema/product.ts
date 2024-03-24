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

import { productCollections } from "./product-collection";
import { productOptions } from "./product-option";
import { productTags } from "./product-tag";
import { productVariants } from "./product-variant";
import { salesChannels } from "./sales-channel";
import { stores } from "./store";
import { taxRates } from "./tax-rate";

const productStatus = ["draft", "published"] as const;

export const products = pgTable(
  "products",
  {
    id: varchar("id").notNull().primaryKey(),
    collectionId: varchar("collectionId").references(
      () => productCollections.id,
    ),
    createdAt: varchar("createdAt").notNull(),
    description: text("description"),
    version: integer("version").notNull(),
    updatedAt: varchar("updatedAt"),
    discountable: boolean("discountable").notNull().default(true),
    handle: varchar("handle"),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    originCountry: varchar("originCountry"),
    status: text("status", {
      enum: productStatus,
    }).default("draft"),
    thumbnail: json("thumbnail"),
    title: varchar("title"),
    updatedBy: varchar("updatedBy"),
    defaultVariantId: varchar("defaultVariantId").notNull(),
    storeId: varchar("storeId").notNull(),
    available: boolean("available").default(true),
    type: varchar("type"),
  },
  (product) => ({
    collectionIdIndex: index("collectionIdIndex").on(product.collectionId),
    handleIndex: uniqueIndex("handleIndex").on(product.handle),
    statusIndex: index("statusIndex").on(product.status),
    defaultVariantIdIndex: index("defaultVariantIdIndex").on(
      product.defaultVariantId,
    ),
    storeIdIndex: index("storeIdIndex").on(product.storeId),
  }),
);
export const productsRelations = relations(products, ({ one, many }) => ({
  collection: one(productCollections, {
    fields: [products.collectionId],
    references: [productCollections.id],
  }),
  variants: many(productVariants, { relationName: "product.variants" }),
  options: many(productOptions),
  tags: many(productsToTags),
  salesChannels: many(productsToSalesChannels),
  taxRates: many(productsToTaxRates),
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));
export const productsToSalesChannels = pgTable(
  "products_to_sales_channels",
  {
    id: varchar("id"),
    productId: varchar("productId")
      .notNull()
      .references(() => products.id),
    salesChannelId: varchar("salesChannelId")
      .notNull()
      .references(() => salesChannels.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.salesChannelId] }),
  }),
);
export const productsToSalesChannelsRelations = relations(
  productsToSalesChannels,
  ({ one }) => ({
    product: one(products, {
      fields: [productsToSalesChannels.productId],
      references: [products.id],
    }),
    sales_channel: one(salesChannels, {
      fields: [productsToSalesChannels.salesChannelId],
      references: [salesChannels.id],
    }),
  }),
);
export const productsToTaxRates = pgTable(
  "products_to_tax_rates",
  {
    id: varchar("id"),
    productId: varchar("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    rateId: varchar("rateId")
      .notNull()
      .references(() => taxRates.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.rateId] }),
  }),
);
export const productsToTaxRatesRelations = relations(
  productsToTaxRates,
  ({ one }) => ({
    product: one(products, {
      fields: [productsToTaxRates.productId],
      references: [products.id],
    }),
    rate: one(taxRates, {
      fields: [productsToTaxRates.rateId],
      references: [taxRates.id],
    }),
  }),
);
export const productsToTags = pgTable(
  "products_to_tags",
  {
    id: varchar("id"),
    productId: varchar("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: varchar("tagId")
      .notNull()
      .references(() => productTags.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.tagId] }),
  }),
);
export const productToTagsRelations = relations(productsToTags, ({ one }) => ({
  product: one(products, {
    fields: [productsToTags.productId],
    references: [products.id],
  }),
  tag: one(productTags, {
    fields: [productsToTags.tagId],
    references: [productTags.id],
  }),
}));
