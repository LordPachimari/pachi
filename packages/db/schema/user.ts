import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

import { stores } from './store'

export const users = pgTable(
  'users',
  {
    id: varchar('id').notNull().primaryKey(),
    lastName: varchar('lastName'),
    firstName: varchar('firstName'),
    username: varchar('username'),
    createdAt: varchar('createdAt').notNull(),
    email: varchar('email').notNull(),
    about: text('about'),
    role: text('role', { enum: ['admin', 'user'] })
      .notNull()
      .default('user'),
    version: integer('version').notNull().default(0),
    billingAddressId: varchar('billingAddressId'),
    updatedAt: varchar('updatedAt'),
    phone: varchar('phone'),
    hashedPassword: varchar('hashedPassword').notNull(),
  },
  (users) => ({
    emailIndex: uniqueIndex('emailIndex').on(users.email),
    usernameIndex: uniqueIndex('usernameIndex').on(users.username),
    billingAddressIdIndex: index('billingAddressIdIndex').on(
      users.billingAddressId,
    ),
  }),
)
export const usersRelations = relations(users, ({ many }) => ({
  stores: many(stores),
}))
