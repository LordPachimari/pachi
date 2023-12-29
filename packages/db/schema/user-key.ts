import { pgTable, varchar } from "drizzle-orm/pg-core";

import { users } from "./user";

export const key = pgTable("user_keys", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  })
    .notNull()
    .references(() => users.id),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});
