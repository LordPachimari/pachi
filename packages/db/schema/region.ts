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
import { fulfillment_providers } from "./fulfillment-provider";
import { payment_providers } from "./payment-provider";
import { tax_providers } from "./tax-provider";
import { tax_rates } from "./tax-rate";

export const regions = pgTable(
  "regions",
  {
    id: varchar("id").notNull().primaryKey(),
    automatic_taxes: boolean("automatic_taxes").notNull().default(true),
    created_at: varchar("created_at"),
    currency_code: varchar("currency_code").notNull(),
    gift_cards_taxable: boolean("gift_cards_taxable").notNull().default(true),
    includes_tax: boolean("includes_tax").default(false),
    name: varchar("name"),
    tax_code: varchar("tax_code"),
    tax_provider_id: varchar("tax_provider_id"),
    tax_rate: integer("tax_rate").notNull(),
    updated_at: varchar("updated_at"),
    version: integer("version").notNull().default(0),
  },
  (region) => ({
    currency_code_index: index("currency_code_index").on(region.currency_code),
    tax_provider_id_index: index("tax_provider_id_index").on(
      region.tax_provider_id,
    ),
  }),
);
export const region_relations = relations(regions, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [regions.currency_code],
    references: [currencies.code],
  }),
  tax_provider: one(tax_providers, {
    fields: [regions.tax_provider_id],
    references: [tax_providers.id],
  }),
  tax_rates: many(tax_rates),
  countries: many(countries),
  payment_providers: many(regions_to_payment_providers),
  fulfillment_providers: many(regions_to_fulfillment_providers),
}));
export const regions_to_payment_providers = pgTable(
  "regions_to_payment_providers",
  {
    id: varchar("id"),
    payment_provider_id: varchar("payment_provider_id")
      .notNull()
      .references(() => payment_providers.id),
    region_id: varchar("region_id")
      .notNull()
      .references(() => regions.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.region_id, t.payment_provider_id),
  }),
);
export const regions_to_payment_providers_relations = relations(
  regions_to_payment_providers,
  ({ one }) => ({
    payment_provider: one(payment_providers, {
      fields: [regions_to_payment_providers.payment_provider_id],
      references: [payment_providers.id],
    }),
    region: one(regions, {
      fields: [regions_to_payment_providers.region_id],
      references: [regions.id],
    }),
  }),
);
export const regions_to_fulfillment_providers = pgTable(
  "r_to_f_providers",
  {
    id: varchar("id"),
    fulfillment_provider_id: varchar("fulfillment_provider_id")
      .notNull()
      .references(() => fulfillment_providers.id, { onDelete: "cascade" }),
    region_id: varchar("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.region_id, t.fulfillment_provider_id),
  }),
);
export const regions_to_fulfillment_providers_relations = relations(
  regions_to_fulfillment_providers,
  ({ one }) => ({
    fulfillment_provider: one(fulfillment_providers, {
      fields: [regions_to_fulfillment_providers.fulfillment_provider_id],
      references: [fulfillment_providers.id],
    }),
    region: one(regions, {
      fields: [regions_to_fulfillment_providers.region_id],
      references: [regions.id],
    }),
  }),
);
