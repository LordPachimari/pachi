import {
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

import type { TableName } from "..";

export type ClientViewRecord = Record<string, number>;
export type ClientViewRecordWTableName = {
  [K in TableName]?: ClientViewRecord;
};
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
export const spaceRecords = pgTable(
  "space_records",
  {
    id: varchar("id").notNull().primaryKey(),
    subspaceID: varchar("id").notNull(),
    spaceID: varchar("space").notNull(),
    record: json("record")
      .notNull()
      .$type<Record<string, ClientViewRecordWTableName>>(),
    version: integer("version"),
  },
  (spaceRecord) => ({
    subspaceIdx: index("subspaceIdx").on(spaceRecord.subspaceID),
    pk: primaryKey({
      columns: [spaceRecord.id, spaceRecord.subspaceID],
    }),
  }),
);
