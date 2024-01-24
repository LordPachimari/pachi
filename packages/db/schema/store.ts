import { relations } from "drizzle-orm";
import {
  integer,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { products } from "./product";
import { users } from "./user";

export const stores = pgTable(
  "stores",
  {
    id: varchar("id").notNull().primaryKey(),
    name: text("name").notNull(),
    currencyCodes: json("currencies").$type<string[]>(),
    founderId: varchar("founderId")
      .references(() => users.id)
      .notNull(),
    about: text("about"),
    version: integer("version").notNull(),
    createdAt: varchar("createdAt").notNull(),
    updatedAt: varchar("updatedAt"),
  },
  (t) => ({
    storeNameIndex: uniqueIndex("storeNameIndex").on(t.name),
  }),
);
export const storesRelations = relations(stores, ({ one, many }) => ({
  founder: one(users, {
    fields: [stores.founderId],
    references: [users.id],
  }),
  products: many(products),
}));
