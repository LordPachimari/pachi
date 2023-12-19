import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import { priceLists } from "./price-list";
import { users } from "./user";

export const customerGroups = pgTable(
  "customerGroups",
  {
    id: varchar("id").notNull().primaryKey(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    name: varchar("name"),
    version: integer("version").notNull().default(0),
    description: text("description"),
  },
  (customerGroup) => ({
    nameIndex: index("nameIndex").on(customerGroup.name),
  }),
);
export const customerGroupRelations = relations(customerGroups, ({ many }) => ({
  customers: many(customersToGroups),
  price_lists: many(customerGroupsToPriceLists),
}));
export const customersToGroups = pgTable(
  "customersToGroups",
  {
    id: varchar("id"),
    version: integer("version"),
    customerId: varchar("customerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    groupId: varchar("groupId")
      .notNull()
      .references(() => customerGroups.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey(t.customerId, t.groupId),
  }),
);
export const customersToGroupsRelations = relations(
  customersToGroups,
  ({ one }) => ({
    customer: one(users, {
      fields: [customersToGroups.customerId],
      references: [users.id],
    }),
    group: one(customerGroups, {
      fields: [customersToGroups.groupId],
      references: [customerGroups.id],
    }),
  }),
);

export const customerGroupsToPriceLists = pgTable(
  "customerGroupsToPriceLists",
  {
    id: varchar("id"),
    customerGroupId: varchar("customerGroupId")
      .notNull()
      .references(() => customerGroups.id),
    priceListId: varchar("priceListId")
      .notNull()
      .references(() => priceLists.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.customerGroupId, t.priceListId),
  }),
);
export const customerGroupsToPriceListsRelations = relations(
  customerGroupsToPriceLists,
  ({ one }) => ({
    customer_group: one(customerGroups, {
      fields: [customerGroupsToPriceLists.customerGroupId],
      references: [customerGroups.id],
    }),
    price_list: one(priceLists, {
      fields: [customerGroupsToPriceLists.priceListId],
      references: [priceLists.id],
    }),
  }),
);
