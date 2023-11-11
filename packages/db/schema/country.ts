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
    display_name: varchar("display_name"),
    iso_2: varchar("iso_2"),
    iso_3: varchar("iso_3"),
    name: varchar("name"),
    num_code: varchar("num_code"),
    region_id: varchar("region_id").references(() => regions.id),
    version: integer("version").notNull().default(0),
  },
  (country) => ({
    region_id_index: index("region_id_index").on(country.region_id),
    iso2_index: uniqueIndex("iso2_index").on(country.iso_2),
    iso3_index: uniqueIndex("iso3_index").on(country.iso_3),
  }),
);
export const country_relations = relations(countries, ({ one }) => ({
  region: one(regions, {
    fields: [countries.region_id],
    references: [regions.id],
  }),
}));
