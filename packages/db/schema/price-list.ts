import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import { customerGroups } from "./customer-group";
import { prices } from "./price";

export const priceLists = pgTable("price_lists", {
  id: varchar("id").notNull().primaryKey(),
  createdAt: varchar("createdAt"),
  updatedAt: varchar("updatedAt"),
  description: text("description"),
  expiresAt: varchar("expiresAt"),
  includesTax: boolean("includesTax").default(false),
  name: varchar("name"),
  startsAt: varchar("startsAt"),
  status: text("status", { enum: ["sales", "override"] })
    .notNull()
    .default("sales"),
  type: text("type", { enum: ["active", "draft"] })
    .notNull()
    .default("draft"),
  updatedBy: varchar("updatedBy"),
  version: integer("version").notNull().default(0),
});
export const priceListRelations = relations(priceLists, ({ many }) => ({
  customerGroups: many(priceListsToCustomerGroups),
  prices: many(prices),
}));
export const priceListsToCustomerGroups = pgTable(
  "price_lists_to_customer_groups",
  {
    id: varchar("id"),
    customerGroupId: varchar("customerGroupId")
      .notNull()
      .references(() => customerGroups.id, { onDelete: "cascade" }),
    priceListId: varchar("priceListId")
      .notNull()
      .references(() => priceLists.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.customerGroupId, t.priceListId] }),
  }),
);
export const priceListsToCustomerGroupsRelations = relations(
  priceListsToCustomerGroups,
  ({ one }) => ({
    customer_group: one(customerGroups, {
      fields: [priceListsToCustomerGroups.customerGroupId],
      references: [customerGroups.id],
    }),
    price_list: one(priceLists, {
      fields: [priceListsToCustomerGroups.priceListId],
      references: [priceLists.id],
    }),
  }),
);
