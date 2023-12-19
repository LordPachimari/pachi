import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const fulfillmentProviders = pgTable("fulfillmentProviders", {
  id: varchar("id").notNull().primaryKey(),
  isInstalled: boolean("isInstalled").default(true),
  version: integer("version").notNull().default(0),
});
