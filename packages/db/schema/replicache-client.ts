import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core"

export const replicacheClients = pgTable(
  "replicache_clients",
  {
    id: varchar("id").notNull().primaryKey(),
    clientGroupID: varchar("clientGroupID").notNull(),
    version: integer("version").notNull(),
    lastMutationID: integer("lastMutationID").notNull(),
  },
  (client) => ({
    groupIdIdx: index("groupIdIdx").on(client.clientGroupID),
    versionIndex: index("versionIndex").on(client.version),
  }),
)
export const replicacheClientGroups = pgTable("replicache_client_groups", {
  id: varchar("id").notNull().primaryKey(),
  spaceRecordVersion: integer("spaceRecordVersion").notNull(),
})
