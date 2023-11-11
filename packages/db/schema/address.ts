import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { countries } from "./country";
import { users } from "./user";

export const addresses = pgTable(
  "addresses",
  {
    id: varchar("id").notNull().primaryKey(),
    address_1: varchar("address_1"),
    address_2: varchar("address_2"),
    city: varchar("city"),
    company: varchar("company"),
    country_code: varchar("country_code")
      .notNull()
      .references(() => countries.iso_2),
    created_at: varchar("created_at"),
    customer_id: varchar("customer_id").references(() => users.id),
    postal_code: varchar("postal_code"),
    province: varchar("province"),
    updated_at: varchar("updated_at"),
    version: integer("version").notNull().default(0),
  },
  (address) => ({
    customer_id_index: index("customer_id_index").on(address.customer_id),
    country_code_index: index("country_code_index").on(address.country_code),
  }),
);
export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(users, {
    fields: [addresses.customer_id],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [addresses.country_code],
    references: [countries.iso_2],
  }),
}));
