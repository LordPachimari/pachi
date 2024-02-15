import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { regions } from "./region";

export const countries = pgTable(
  "countries",
  {
    id: varchar("id"),
    displayName: varchar("displayName"),
    countryCode: varchar("countryCode").primaryKey(),
    name: varchar("name"),
    numCode: varchar("numCode"),
    regionId: varchar("regionId").references(() => regions.id),
    version: integer("version").notNull().default(0),
  },
  (country) => ({
    regionIdIndex: index("regionIdIndex").on(country.regionId),
  }),
);
export const countryRelations = relations(countries, ({ one }) => ({
  region: one(regions, {
    fields: [countries.regionId],
    references: [regions.id],
  }),
}));
