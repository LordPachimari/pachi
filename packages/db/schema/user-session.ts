import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core"

import { users } from "./user"

export const session = pgTable("user_sessions", {
  id: varchar("id", {
    length: 128,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  })
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  country: varchar("country", {
    length: 2,
  }),
})
