import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const taxProviders = pgTable("tax_providers", {
  id: varchar("id").notNull().primaryKey(),
  isInstalled: boolean("isInstalled").default(true),
  version: integer("version").notNull().default(0),
});
