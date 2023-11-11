import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import { fulfillment_providers } from "./fulfillment-provider";
import { regions } from "./region";
import { tax_rates } from "./tax-rate";

export const shipping_options = pgTable(
  "shipping_options",
  {
    id: varchar("id").notNull().primaryKey(),
    created_at: varchar("created_at"),
    updated_at: varchar("updated_at"),
    admin_only: boolean("admin_only"),
    amount: integer("amount"),
    data: json("data").$type<Record<string, unknown>>(),
    includes_tax: boolean("includes_tax"),
    is_return: boolean("is_return"),
    name: varchar("name"),
    price_type: text("price_type", { enum: ["calculated", "flat_rate"] }),
    provider_id: varchar("provider_id"),
    region_id: varchar("region_id"),
    version: integer("version").notNull().default(0),
  },
  (t) => ({
    provider_id_index: index("provider_id_index").on(t.provider_id),
    region_id_index2: index("region_id_index2").on(t.region_id),
  }),
);
export const shipping_option_relations = relations(
  shipping_options,
  ({ one, many }) => ({
    provider: one(fulfillment_providers, {
      fields: [shipping_options.provider_id],
      references: [fulfillment_providers.id],
    }),
    region: one(regions, {
      fields: [shipping_options.region_id],
      references: [regions.id],
    }),
    requirements: many(shipping_options_requirements),
  }),
);
export const shipping_options_requirements = pgTable(
  "shipping_option_requirements",
  {
    id: varchar("id").notNull().primaryKey(),
    amount: integer("amount"),
    shipping_option_id: varchar("shipping_option_id"),
    type: text("type", { enum: ["max_subtotal", "min_subtotal"] }),
    version: integer("version"),
  },
  (t) => ({
    shipping_option_id_index: index("shipping_option_id_index").on(
      t.shipping_option_id,
    ),
  }),
);
export const shipping_option_requirement_relations = relations(
  shipping_options_requirements,
  ({ one }) => ({
    shipping_option: one(shipping_options, {
      fields: [shipping_options_requirements.shipping_option_id],
      references: [shipping_options.id],
    }),
  }),
);
export const shipping_options_to_tax_rates = pgTable(
  "shipping_options_to_tax_rates",
  {
    id: varchar("id"),
    rate_id: varchar("rate_id")
      .notNull()
      .references(() => tax_rates.id),
    shipping_option_id: varchar("shipping_option_id")
      .notNull()
      .references(() => shipping_options.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey(t.shipping_option_id, t.rate_id),
  }),
);
export const shipping_option_to_tax_rates_relations = relations(
  shipping_options_to_tax_rates,
  ({ one }) => ({
    rate: one(tax_rates, {
      fields: [shipping_options_to_tax_rates.rate_id],
      references: [tax_rates.id],
    }),
    shipping_option: one(shipping_options, {
      fields: [shipping_options_to_tax_rates.shipping_option_id],
      references: [shipping_options.id],
    }),
  }),
);
