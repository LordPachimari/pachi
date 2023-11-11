import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import { price_lists } from "./price-list";
import { users } from "./user";

export const customer_groups = pgTable(
  "customer_groups",
  {
    id: varchar("id").notNull().primaryKey(),
    created_at: varchar("created_at"),
    updated_at: varchar("updated_at"),
    name: varchar("name"),
    version: integer("version").notNull().default(0),
    description: text("description"),
  },
  (customer_group) => ({
    name_index: index("name_index").on(customer_group.name),
  }),
);
export const customer_group_relations = relations(
  customer_groups,
  ({ many }) => ({
    customers: many(customers_to_groups),
    price_lists: many(customer_groups_to_price_lists),
  }),
);
export const customers_to_groups = pgTable(
  "customers_to_groups",
  {
    id: varchar("id"),
    version: integer("version"),
    customer_id: varchar("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    group_id: varchar("group_id")
      .notNull()
      .references(() => customer_groups.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey(t.customer_id, t.group_id),
  }),
);
export const customers_to_groups_relations = relations(
  customers_to_groups,
  ({ one }) => ({
    customer: one(users, {
      fields: [customers_to_groups.customer_id],
      references: [users.id],
    }),
    group: one(customer_groups, {
      fields: [customers_to_groups.group_id],
      references: [customer_groups.id],
    }),
  }),
);

export const customer_groups_to_price_lists = pgTable(
  "customer_groups_to_price_lists",
  {
    id: varchar("id"),
    customer_group_id: varchar("customer_group_id")
      .notNull()
      .references(() => customer_groups.id),
    price_list_id: varchar("price_list_id")
      .notNull()
      .references(() => price_lists.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.customer_group_id, t.price_list_id),
  }),
);
export const customer_groups_to_price_lists_relations = relations(
  customer_groups_to_price_lists,
  ({ one }) => ({
    customer_group: one(customer_groups, {
      fields: [customer_groups_to_price_lists.customer_group_id],
      references: [customer_groups.id],
    }),
    price_list: one(price_lists, {
      fields: [customer_groups_to_price_lists.price_list_id],
      references: [price_lists.id],
    }),
  }),
);
