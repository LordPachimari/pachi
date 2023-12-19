import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { products } from "./product";

export const productCollections = pgTable(
  "productCollections",
  {
    id: varchar("id").notNull().primaryKey(),
    handle: varchar("handle"),
    createdAt: varchar("createdAt"),
    title: varchar("title"),
    updatedAt: varchar("updatedAt"),
    version: integer("version").notNull().default(0),
    storeId: varchar("storeId").notNull(),
  },
  (productCollection) => ({
    handleIndex1: uniqueIndex("handleIndex1").on(productCollection.handle),
    storeIdIndex1: index("storeIdIndex1").on(productCollection.storeId),
  }),
);
export const productCollectionRelations = relations(
  productCollections,
  ({ many }) => ({
    products: many(products),
  }),
);
