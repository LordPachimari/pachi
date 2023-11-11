import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const sales_channels = pgTable("sales_channels", {
  id: varchar("id").notNull().primaryKey(),
  created_at: varchar("created_at"),
  description: text("description"),
  is_disabled: boolean("is_disabled").default(false),
  title: varchar("title").notNull(),
  updated_at: varchar("updated_at"),
  version: integer("version").notNull().default(0),
});
