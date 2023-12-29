import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const salesChannels = pgTable("sales_channels", {
  id: varchar("id").notNull().primaryKey(),
  createdAt: varchar("createdAt"),
  description: text("description"),
  isDisabled: boolean("isDisabled").default(false),
  title: varchar("title").notNull(),
  updatedAt: varchar("updatedAt"),
  version: integer("version").notNull().default(0),
});
