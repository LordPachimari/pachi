import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
  id: varchar("id"),
  code: varchar("code").notNull().primaryKey(),
  includesTax: boolean("includesTax").default(false),
  name: varchar("name"),
  symbol: varchar("symbol"),
  symbolNative: varchar("symbolNative"),
  version: integer("version").notNull().default(0),
});
