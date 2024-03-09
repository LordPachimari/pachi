import { relations } from "drizzle-orm"
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core"

import { productsToTaxRates } from "./product"
import { regions } from "./region"
import { shippingOptionsToTaxRates } from "./shipping-option"

export const taxRates = pgTable(
  "tax_rates",
  {
    id: varchar("id").notNull().primaryKey(),
    createdAt: varchar("createdAt"),
    updatedAt: varchar("updatedAt"),
    name: varchar("name").notNull(),
    rate: integer("rate"),
    regionId: varchar("regionId"),
    version: integer("version").notNull().default(0),
    code: varchar("code").notNull(),
  },
  (t) => ({
    regionIdIndex: index("regionIdIndex").on(t.regionId),
  }),
)
export const taxRatesRelations = relations(taxRates, ({ one, many }) => ({
  region: one(regions, {
    fields: [taxRates.regionId],
    references: [regions.id],
  }),
  products: many(productsToTaxRates),
  shipping_options: many(shippingOptionsToTaxRates),
}))
