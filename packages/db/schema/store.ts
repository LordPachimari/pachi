import { relations } from "drizzle-orm";
import {
  integer,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import type { Currency } from "../validators/schema";
import { products } from "./product";
import { users } from "./user";

export const stores = pgTable(
  "stores",
  {
    id: varchar("id").notNull().primaryKey(),
    name: text("name").notNull(),
    currencies: json("currencies").$type<string[]>(),
    founder_id: varchar("founder_id")
      .references(() => users.id)
      .notNull(),
    version: integer("version").notNull(),
    created_at: varchar("created_at").notNull(),
  },
  (t) => ({
    storeNameIndex: uniqueIndex("store_name_index").on(t.name),
  }),
);
export const stores_relations = relations(stores, ({ one, many }) => ({
  founder: one(users, {
    fields: [stores.founder_id],
    references: [users.id],
  }),
  products: many(products),
}));
