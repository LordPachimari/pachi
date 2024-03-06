import { integer, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

export const returnReasons = pgTable(
  'return_reasons',
  {
    id: varchar('id').notNull().primaryKey(),
    createdAt: varchar('createdAt'),
    updatedAt: varchar('updatedAt'),
    description: varchar('description'),
    label: varchar('label'),
    value: varchar('value'),
    version: integer('version').notNull().default(0),
  },
  (t) => ({
    valueIndex: uniqueIndex('valueIndex').on(t.value),
  }),
)
