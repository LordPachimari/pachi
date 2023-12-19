import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { countries } from "./country";
import { users } from "./user";

export const addresses = pgTable(
  "addresses",
  {
    id: varchar("id").notNull().primaryKey(),
    address1: varchar("address1"),
    address2: varchar("address2"),
    city: varchar("city"),
    company: varchar("company"),
    countryCode: varchar("countryCode")
      .notNull()
      .references(() => countries.iso2),
    createdAt: varchar("createdAt"),
    customerId: varchar("customerId").references(() => users.id),
    postalCode: varchar("postalCode"),
    province: varchar("province"),
    updatedAt: varchar("updatedAt"),
    version: integer("version").notNull().default(0),
  },
  (address) => ({
    customerIdIndex: index("customerIdIndex").on(address.customerId),
    countryCodeIndex: index("countryCodeIndex").on(address.countryCode),
  }),
);
export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(users, {
    fields: [addresses.customerId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [addresses.countryCode],
    references: [countries.iso2],
  }),
}));
