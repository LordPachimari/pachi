import {
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

export type ClientViewRecord = Record<string, number>;
export const replicacheClients = pgTable(
  "replicache_clients",
  {
    id: varchar("id").notNull().primaryKey(),
    clientGroupID: varchar("clientGroupID").notNull(),
    version: integer("version"),
    lastMutationID: integer("lastMutationID").notNull(),
  },
  (client) => ({
    groupIdIdx: index("groupIdIdx").on(client.clientGroupID),
  }),
);
export const replicacheClientGroups = pgTable("replicache_client_groups", {
  id: varchar("id").notNull().primaryKey(),
  spaceRecordVersion: integer("spaceRecordVersion").notNull(),
});
export const replicacheSubspaceRecords = pgTable(
  "replicaсhe_subspace_records",
  {
    id: varchar("id").notNull().primaryKey(),
    subspaceID: varchar("id").notNull(),
    record: json("record").notNull().$type<ClientViewRecord>(),
    version: integer("version"),
  },
  (spaceRecord) => ({
    subspaceIdx: index("subspaceIdx").on(spaceRecord.subspaceID),
    pk: primaryKey({
      columns: [spaceRecord.id, spaceRecord.subspaceID],
    }),
  }),
);
