import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { discountConditions } from "./discount-condition";

export const discountRules = pgTable("discountRules", {
  allocation: varchar("allocation", { enum: ["item", "total"] }),
  id: varchar("id").notNull().primaryKey(),
  createdAt: varchar("createdAt"),
  updatedAt: varchar("updatedAt"),
  description: varchar("description"),
  type: varchar("type", { enum: ["fixed", "percentage", "freeShipping"] }),
  value: integer("value").notNull(),
  version: integer("version").notNull().default(0),
});
export const discountRulesRelations = relations(
  discountRules,
  ({ many }) => ({
    conditions: many(discountConditions),
  }),
);

