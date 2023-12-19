import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { productsToTags } from "./product";

export const productTags = pgTable("productTags", {
  id: varchar("id").notNull().primaryKey(),
  createdAt: varchar("createdAt").notNull(),
  updatedAt: varchar("updatedAt"),
  value: varchar("value").notNull(),
  version: integer("version").notNull().default(0),
});
export const productTagsRelations = relations(productTags, ({ many }) => ({
  products: many(productsToTags),
}));
