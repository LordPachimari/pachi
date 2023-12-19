import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

import { countries } from "./country";
import { currencies } from "./currency";
import { fulfillmentProviders } from "./fulfillment-provider";
import { paymentProviders } from "./payment-provider";
import { taxProviders } from "./tax-provider";
import { taxRates } from "./tax-rate";

export const regions = pgTable(
  "regions",
  {
    id: varchar("id").notNull().primaryKey(),
    automaticTaxes: boolean("automaticTaxes").notNull().default(true),
    createdAt: varchar("createdAt"),
    currencyCode: varchar("currencyCode").notNull(),
    giftCardsTaxable: boolean("giftCardsTaxable").notNull().default(true),
    includesTax: boolean("includesTax").default(false),
    name: varchar("name"),
    taxCode: varchar("taxCode"),
    taxProviderId: varchar("taxProviderId"),
    taxRate: integer("taxRate").notNull(),
    updatedAt: varchar("updatedAt"),
    version: integer("version").notNull().default(0),
  },
  (region) => ({
    currencyCodeIndex: index("currencyCodeIndex").on(region.currencyCode),
    taxProviderIdIndex: index("taxProviderIdIndex").on(region.taxProviderId),
  }),
);
export const region_relations = relations(regions, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [regions.currencyCode],
    references: [currencies.code],
  }),
  taxProvider: one(taxProviders, {
    fields: [regions.taxProviderId],
    references: [taxProviders.id],
  }),
  taxRates: many(taxRates),
  countries: many(countries),
  paymentProviders: many(regionsToPaymentProviders),
  fulfillmentProviders: many(regionsToFulfillmentProviders),
}));
export const regionsToPaymentProviders = pgTable(
  "regionsToPaymentProviders",
  {
    id: varchar("id"),
    paymentProviderId: varchar("paymentProviderId")
      .notNull()
      .references(() => paymentProviders.id),
    regionId: varchar("regionId")
      .notNull()
      .references(() => regions.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.regionId, t.paymentProviderId),
  }),
);
export const regionsToPaymentProvidersRelations = relations(
  regionsToPaymentProviders,
  ({ one }) => ({
    payment_provider: one(paymentProviders, {
      fields: [regionsToPaymentProviders.paymentProviderId],
      references: [paymentProviders.id],
    }),
    region: one(regions, {
      fields: [regionsToPaymentProviders.regionId],
      references: [regions.id],
    }),
  }),
);
export const regionsToFulfillmentProviders = pgTable(
  "r_to_f_providers",
  {
    id: varchar("id"),
    fulfillmentProviderId: varchar("fulfillmentProviderId")
      .notNull()
      .references(() => fulfillmentProviders.id, { onDelete: "cascade" }),
    regionId: varchar("regionId")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.regionId, t.fulfillmentProviderId),
  }),
);
export const regionsToFulfillmentProvidersRelations = relations(
  regionsToFulfillmentProviders,
  ({ one }) => ({
    fulfillment_provider: one(fulfillmentProviders, {
      fields: [regionsToFulfillmentProviders.fulfillmentProviderId],
      references: [fulfillmentProviders.id],
    }),
    region: one(regions, {
      fields: [regionsToFulfillmentProviders.regionId],
      references: [regions.id],
    }),
  }),
);
