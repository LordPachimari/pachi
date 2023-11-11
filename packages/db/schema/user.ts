import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { stores } from "./store";

export const users = pgTable(
  "users",
  {
    id: varchar("id").notNull().primaryKey(),
    last_name: varchar("last_name"),
    first_name: varchar("first_name"),
    username: varchar("username").notNull(),
    created_at: varchar("created_at"),
    email: varchar("email").notNull(),
    role: text("role", { enum: ["admin", "user"] })
      .notNull()
      .default("user"),
    version: integer("version").notNull().default(0),
    billing_address_id: varchar("billing_address_id"),
    updated_at: varchar("updated_at"),
    phone: varchar("phone"),
    total: integer("total"),
  },
  (users) => ({
    email_index: uniqueIndex("email_index").on(users.email),
    username_index: uniqueIndex("username_index").on(users.username),
    billing_address_id_index: index("billing_address_id_index").on(
      users.billing_address_id,
    ),
  }),
);
export const users_relations = relations(users, ({ many }) => ({
  stores: many(stores),
}));
