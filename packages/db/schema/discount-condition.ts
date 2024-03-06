import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  varchar,
} from 'drizzle-orm/pg-core'

import { customerGroups } from './customer-group'
import { discountRules } from './discount-rule'
import { products } from './product'

export const discountConditions = pgTable(
  'discount_conditions',
  {
    id: varchar('id').notNull().primaryKey(),
    createdAt: varchar('createdAt'),
    updatedAt: varchar('updatedAt'),
    discountRuleId: varchar('discountRuleId'),
    type: text('type', {
      enum: [
        'customerGroups',
        'products',
        'productTags',
        'productTypes',
        'productCollections',
      ] as const,
    }).notNull(),
    version: integer('version').notNull().default(0),
    operator: varchar('operator', {
      enum: ['IN', 'NOT_IN'] as const,
    }).notNull(),
  },
  (discountCondition) => ({
    discountRuleIdIndex: index('discountRuleIdIndex').on(
      discountCondition.discountRuleId,
    ),
  }),
)

export const discountConditionRelations = relations(
  discountConditions,
  ({ one, many }) => ({
    discountRule: one(discountRules, {
      fields: [discountConditions.discountRuleId],
      references: [discountRules.id],
    }),
    products: many(discountConditionProducts),
    // product_collections: many(d),
    customerGroups: many(discountConditionCustomerGroups),
  }),
)
export const discountConditionsToProducts = pgTable(
  'discount_conditions_to_products',
  {
    conditionId: varchar('conditionId')
      .notNull()
      .references(() => discountConditions.id),
    productId: varchar('productId')
      .notNull()
      .references(() => products.id),
  },
  (t) => ({
    pk: primaryKey(t.conditionId, t.productId),
  }),
)
export const discountConditionsToProductsRelations = relations(
  discountConditionsToProducts,
  ({ one }) => ({
    condition: one(discountConditions, {
      fields: [discountConditionsToProducts.conditionId],
      references: [discountConditions.id],
    }),
    product: one(products, {
      fields: [discountConditionsToProducts.productId],
      references: [products.id],
    }),
  }),
)
export const discountConditionsToCustomerGroups = pgTable(
  'discount_conditions_to_customer_groups',
  {
    conditionId: varchar('conditionId')
      .notNull()
      .references(() => discountConditions.id),
    customerGroupId: varchar('customerGroupId')
      .notNull()
      .references(() => customerGroups.id),
  },
  (t) => ({
    pk: primaryKey(t.conditionId, t.customerGroupId),
  }),
)
export const discountConditionsToCustomerGroupsRelations = relations(
  discountConditionsToCustomerGroups,
  ({ one }) => ({
    condition: one(discountConditions, {
      fields: [discountConditionsToCustomerGroups.conditionId],
      references: [discountConditions.id],
    }),
    customerGroup: one(customerGroups, {
      fields: [discountConditionsToCustomerGroups.customerGroupId],
      references: [customerGroups.id],
    }),
  }),
)

export const discountConditionCustomerGroups = pgTable(
  'discount_condition_customer_groups',
  {
    conditionId: varchar('conditionId')
      .notNull()
      .references(() => discountConditions.id),
    createdAt: varchar('createdAt'),
    customerGroupId: varchar('customerGroupId')
      .notNull()
      .references(() => customerGroups.id),
    discountConditionId: varchar('discountConditionId'),
    updatedAt: varchar('updatedAt'),
  },
  (t) => ({
    pk: primaryKey(t.customerGroupId, t.conditionId),
    discountConditionIdIndex: index('discountConditionIdIndex').on(
      t.discountConditionId,
    ),
  }),
)
export const discountConditionsCustomerGroupsRelations = relations(
  discountConditionCustomerGroups,
  ({ one }) => ({
    discountCondition: one(discountConditions, {
      fields: [discountConditionCustomerGroups.conditionId],
      references: [discountConditions.id],
    }),
    customerGroups: one(customerGroups, {
      fields: [discountConditionCustomerGroups.customerGroupId],
      references: [customerGroups.id],
    }),
  }),
)

export const discountConditionProducts = pgTable(
  'discount_condition_products',
  {
    conditionId: varchar('conditionId').notNull(),
    createdAt: varchar('createdAt'),
    discountConditionId: varchar('discountConditionId'),
    updatedAt: varchar('updatedAt'),
    productId: varchar('productId').notNull(),
  },
  (t) => ({
    pk: primaryKey(t.productId, t.conditionId),
    discountConditionIdIndex1: index('discountConditionIdIndex1').on(
      t.discountConditionId,
    ),
  }),
)
export const discountConditionsProductsRelations = relations(
  discountConditionProducts,
  ({ one }) => ({
    discountCondition: one(discountConditions, {
      fields: [discountConditionProducts.conditionId],
      references: [discountConditions.id],
    }),
    product: one(products, {
      fields: [discountConditionProducts.productId],
      references: [products.id],
    }),
  }),
)
