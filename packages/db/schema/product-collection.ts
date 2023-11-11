import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { products } from "./product";

export const product_collections = pgTable(
  "product_collections",
  {
    id: varchar("id").notNull().primaryKey(),
    handle: varchar("handle"),
    created_at: varchar("created_at"),
    title: varchar("title"),
    updated_at: varchar("updated_at"),
    version: integer("version").notNull().default(0),
    store_id: varchar("store_id").notNull(),
  },
  (product_collection) => ({
    handle_index_1: uniqueIndex("handle_index_1").on(product_collection.handle),
    store_id_index_1: index("store_id_index_1").on(product_collection.store_id),
  }),
);
export const product_collection_relations = relations(
  product_collections,
  ({ many }) => ({
    products: many(products),
  }),
);
