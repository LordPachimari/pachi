import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
  id: varchar("id"),
  code: varchar("code").notNull().primaryKey(),
  includes_tax: boolean("includes_tax").default(false),
  name: varchar("name"),
  symbol: varchar("symbol"),
  symbol_native: varchar("symbol_native"),
  version: integer("version").notNull().default(0),
});
