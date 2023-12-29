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
import { prices } from "./price";
import { products } from "./product";
import { productOptionValuesToProductVariants } from "./product-option-value";

export const productVariants = pgTable(
  "product_variants",
  {
    id: varchar("id").notNull().primaryKey(),
    barcode: varchar("barcode"),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    ean: varchar("ean"),
    height: integer("height"),
    hsCode: varchar("hs_code"),
    inventoryQuantity: integer("inventoryQuantity").notNull().default(0),
    length: integer("length"),
    material: varchar("material"),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    midCode: varchar("midCode"),
    originCountry: text("originCountry"),
    productId: varchar("productId")
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
    allowBackorder: boolean("allowBackorder").default(false),
    available: boolean("available").default(true),
  },
  (productVariant) => ({
    productIdIndex: index("productIdIndex").on(productVariant.productId),
  }),
);
export const productVariantRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
      relationName: "product.variants",
    }),
    prices: many(prices),
    optionValues: many(productOptionValuesToProductVariants, {
      relationName: "variant.optionValues",
    }),
  }),
);
