import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const product_tags = pgTable("product_tags", {
  id: varchar("id").notNull().primaryKey(),
  created_at: varchar("created_at"),
  updated_at: varchar("updated_at"),
  value: varchar("value").notNull(),
  version: integer("version").notNull().default(0),
});
