import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { productOptions } from "./product-option";
import { productVariants } from "./product-variant";

export const productOptionValues = pgTable(
  "productOptionValues",
  {
    id: varchar("id").notNull().primaryKey(),
    variantId: varchar("variantId").references(() => productVariants.id),
    value: varchar("value").notNull(),
    optionId: varchar("optionId")
      .notNull()
      .references(() => productOptions.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(0),
    optionName: varchar("optionName").notNull(),
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
  ({ one }) => ({
    variant: one(productVariants, {
      fields: [productOptionValues.variantId],
      references: [productVariants.id],
    }),
    option: one(productOptions, {
      fields: [productOptionValues.optionId],
      references: [productOptions.id],
    }),
  }),
);
