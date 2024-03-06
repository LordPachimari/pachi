import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

export const productCategory = pgTable('product_category', {
  id: varchar('id').notNull().primaryKey(),
  name: varchar('name').notNull(),
  version: integer('version').notNull().default(0),
})
