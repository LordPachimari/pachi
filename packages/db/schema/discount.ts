import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

import { discountRules } from './discount-rule'
import { regions } from './region'

export const discounts = pgTable(
  'discounts',
  {
    id: varchar('id').notNull().primaryKey(),
    code: varchar('code'),
    createdAt: varchar('createdAt'),
    updatedAt: varchar('updatedAt'),
    expiresAt: varchar('expiresAt'),
    isDisabled: boolean('isDisabled'),
    isDynamic: boolean('isDynamic'),
    parentDiscountId: varchar('parentDiscountId'),
    ruleId: varchar('ruleId').notNull(),
    startsAt: varchar('startsAt'),
    usageCount: integer('usageCount'),
    usageLimit: integer('usageLimit'),
    validDuration: varchar('validDuration'),
    version: integer('version').notNull().default(0),
  },

  (discount) => ({
    parentDiscountIdIndex: index('parentDiscountIdIndex').on(
      discount.parentDiscountId,
    ),
    ruleIdIndex: index('ruleIdIndex').on(discount.ruleId),
    codeIndex: uniqueIndex('codeIndex').on(discount.code),
  }),
)
export const discounts_relations = relations(discounts, ({ one, many }) => ({
  parent_discount: one(discounts, {
    fields: [discounts.parentDiscountId],
    references: [discounts.id],
  }),
  rule: one(discountRules, {
    fields: [discounts.ruleId],
    references: [discountRules.id],
  }),
  many: many(discountsToRegions),
}))
export const discountsToRegions = pgTable(
  'discounts_to_regions',
  {
    discountId: varchar('discountId')
      .notNull()
      .references(() => discounts.id),
    regionId: varchar('regionId')
      .notNull()
      .references(() => regions.id),
  },
  (t) => ({
    pk: primaryKey(t.discountId, t.regionId),
  }),
)
export const discountsToRegionsRelations = relations(
  discountsToRegions,
  ({ one }) => ({
    discount: one(discounts, {
      fields: [discountsToRegions.discountId],
      references: [discounts.id],
    }),
    region: one(regions, {
      fields: [discountsToRegions.regionId],
      references: [regions.id],
    }),
  }),
)
