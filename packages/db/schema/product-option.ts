import { relations } from 'drizzle-orm'
import { index, integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { products } from './product'
import { productOptionValues } from './product-option-value'

export const productOptions = pgTable(
  'product_options',
  {
    id: varchar('id').notNull().primaryKey(),
    productId: varchar('productId')
      .references(() => products.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    name: varchar('name'),
    version: integer('version').notNull().default(0),
  },
  (productOption) => ({
    productIdIndex2: index('productIdIndex2').on(productOption.productId),
  }),
)
export const productOptionRelations = relations(
  productOptions,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productOptions.productId],
      references: [products.id],
    }),
    values: many(productOptionValues),
  }),
)
