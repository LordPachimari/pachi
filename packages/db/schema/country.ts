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
    id: varchar("id").notNull().primaryKey(),
    displayName: varchar("displayName"),
    iso2: varchar("iso2"),
    iso3: varchar("iso3"),
    name: varchar("name"),
    numCode: varchar("numCode"),
    regionId: varchar("regionId").references(() => regions.id),
    version: integer("version").notNull().default(0),
  },
  (country) => ({
    regionIdIndex: index("regionIdIndex").on(country.regionId),
    iso2Index: uniqueIndex("iso2Index").on(country.iso2),
    iso3Index: uniqueIndex("iso3Index").on(country.iso3),
  }),
);
export const countryRelations = relations(countries, ({ one }) => ({
  region: one(regions, {
    fields: [countries.regionId],
    references: [regions.id],
  }),
}));
