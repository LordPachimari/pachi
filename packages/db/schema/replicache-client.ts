import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const replicacheClients = pgTable(
  "replicacheClients",
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
);
