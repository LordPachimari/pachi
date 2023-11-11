import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const tax_providers = pgTable("tax_providers", {
  id: varchar("id").notNull().primaryKey(),
  is_installed: boolean("is_installed").default(true),
  version: integer("version").notNull().default(0),
});
