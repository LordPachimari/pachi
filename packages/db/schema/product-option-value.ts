import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

import { productOptions } from "./product-option";
import { productVariants } from "./product-variant";

export const productOptionValues = pgTable(
  "product_option_values",
  {
    id: varchar("id").notNull().primaryKey(),
    variantId: varchar("variantId").references(() => productVariants.id),
    value: varchar("value").notNull(),
    optionId: varchar("optionId")
      .notNull()
      .references(() => productOptions.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(0),
  },
  (productOption) => ({
    productVariantIdIndex: index("productVariantIdIndex").on(
      productOption.variantId,
    ),
    optionIdIndex: index("optionIdIndex").on(productOption.optionId),
  }),
);
export const productOptionValuesRelations = relations(
  productOptionValues,
  ({ one, many }) => ({
    option: one(productOptions, {
      fields: [productOptionValues.optionId],
      references: [productOptions.id],
    }),
    optionValues: many(productOptionValuesToProductVariants),
  }),
);
export const productOptionValuesToProductVariants = pgTable(
  "product_option_values_to_product_variants",
  {
    id: varchar("id"),
    optionValueId: varchar("optionValueId")
      .notNull()
      .references(() => productOptionValues.id, { onDelete: "cascade" }),
    variantId: varchar("variantId")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.optionValueId, t.variantId] }),
  }),
);
export const productOptionValuesToProductVariantsRelations = relations(
  productOptionValuesToProductVariants,
  ({ one }) => ({
    variant: one(productVariants, {
      fields: [productOptionValuesToProductVariants.variantId],
      references: [productVariants.id],
      relationName: "variant.optionValues",
    }),
    value: one(productOptionValues, {
      fields: [productOptionValuesToProductVariants.optionValueId],
      references: [productOptionValues.id],
    }),
  }),
);
