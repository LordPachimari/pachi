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

import { regions } from "./region";
import {  shippingProviders } from "./shipping-provider";
import { taxRates } from "./tax-rate";

export const shippingOptions = pgTable(
  "shipping_options",
  {
    id: varchar("id").notNull().primaryKey(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    adminOnly: boolean("adminOnly"),
    amount: integer("amount"),
    data: json("data").$type<Record<string, unknown>>(),
    includesTax: boolean("includesTax"),
    isReturn: boolean("isReturn"),
    name: varchar("name"),
    priceType: text("priceType", { enum: ["calculated", "flatRate"] }),
    providerId: varchar("providerId"),
    regionId: varchar("regionId"),
    version: integer("version").notNull().default(0),
  },
  (t) => ({
    providerIdIndex: index("providerIdIndex").on(t.providerId),
    regionIdIndex: index("regionIdIndex").on(t.regionId),
  }),
);
export const shippingOptionRelations = relations(
  shippingOptions,
  ({ one, many }) => ({
    provider: one(shippingProviders, {
      fields: [shippingOptions.providerId],
      references: [shippingProviders.id],
    }),
    region: one(regions, {
      fields: [shippingOptions.regionId],
      references: [regions.id],
    }),
    requirements: many(shippingOptionsRequirements),
  }),
);
export const shippingOptionsRequirements = pgTable(
  "shipping_option_requirements",
  {
    id: varchar("id").notNull().primaryKey(),
    amount: integer("amount"),
    shippingOptionId: varchar("shippingOptionId"),
    type: text("type", { enum: ["maxSubtotal", "minSubtotal"] }),
    version: integer("version"),
  },
  (t) => ({
    shippingOptionIdIndex: index("shippingOptionIdIndex").on(
      t.shippingOptionId,
    ),
  }),
);
export const shippingOptionRequirementRelations = relations(
  shippingOptionsRequirements,
  ({ one }) => ({
    shipping_option: one(shippingOptions, {
      fields: [shippingOptionsRequirements.shippingOptionId],
      references: [shippingOptions.id],
    }),
  }),
);
export const shippingOptionsToTaxRates = pgTable(
  "shipping_options_to_tax_rates",
  {
    id: varchar("id"),
    rateId: varchar("rateId")
      .notNull()
      .references(() => taxRates.id),
    shippingOptionId: varchar("shippingOptionId")
      .notNull()
      .references(() => shippingOptions.id),
    version: integer("version"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.shippingOptionId, t.rateId] }),
  }),
);
export const shippingOptionToTaxRatesRelations = relations(
  shippingOptionsToTaxRates,
  ({ one }) => ({
    rate: one(taxRates, {
      fields: [shippingOptionsToTaxRates.rateId],
      references: [taxRates.id],
    }),
    shipping_option: one(shippingOptions, {
      fields: [shippingOptionsToTaxRates.shippingOptionId],
      references: [shippingOptions.id],
    }),
  }),
);
