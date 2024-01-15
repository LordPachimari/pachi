import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
  id: varchar("id"),
  code: varchar("code").notNull().primaryKey(),
  name: varchar("name"),
  symbol: varchar("symbol"),
  version: integer("version").notNull().default(0),
});
