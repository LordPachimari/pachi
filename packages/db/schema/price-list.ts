import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import { customer_groups } from "./customer-group";
import { money_amount } from "./money-amount";

export const price_lists = pgTable("price_lists", {
  id: varchar("id").notNull().primaryKey(),
  created_at: varchar("created_at"),
  updated_at: varchar("updated_at"),
  description: text("description"),
  expires_at: varchar("expires_at"),
  includes_tax: boolean("includes_tax").default(false),
  name: varchar("name"),
  starts_at: varchar("starts_at"),
  status: text("status", { enum: ["sales", "override"] })
    .notNull()
    .default("sales"),
  type: text("type", { enum: ["active", "draft"] })
    .notNull()
    .default("draft"),
  updated_by: varchar("updated_by"),
  version: integer("version").notNull().default(0),
});

export const price_list_relations = relations(price_lists, ({ many }) => ({
  customer_groups: many(price_lists_to_customer_groups),
  prices: many(money_amount),
}));
export const price_lists_to_customer_groups = pgTable(
  "price_lists_to_customer_groups",
  {
    id: varchar("id"),
    customer_group_id: varchar("customer_group_id")
      .notNull()
      .references(() => customer_groups.id, { onDelete: "cascade" }),
    price_list_id: varchar("price_list_id")
      .notNull()
      .references(() => price_lists.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.customer_group_id, t.price_list_id),
  }),
);
export const price_lists_to_customer_groups_relations = relations(
  price_lists_to_customer_groups,
  ({ one }) => ({
    customer_group: one(customer_groups, {
      fields: [price_lists_to_customer_groups.customer_group_id],
      references: [customer_groups.id],
    }),
    price_list: one(price_lists, {
      fields: [price_lists_to_customer_groups.price_list_id],
      references: [price_lists.id],
    }),
  }),
);
