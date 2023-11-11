import type { Transaction } from "@pachi/db";
import { replicache_clients } from "@pachi/db";

export const setLastMutationIdsAndVersions_ = ({
  lastMutationIdsAndVersions,
  clientGroupID,
  transaction,
}: {
  lastMutationIdsAndVersions: Record<
    string,
    { lastMutationID: number; version: number }
  >;
  clientGroupID: string;
  transaction: Transaction;
}) => {
  const queries = [];
  for (const [key, { lastMutationID, version }] of Object.entries(
    lastMutationIdsAndVersions,
  )) {
    queries.push(
      transaction
        .insert(replicache_clients)
        .values({ id: key, lastMutationID, version: 1, clientGroupID })
        .onConflictDoUpdate({
          target: replicache_clients.id,
          set: {
            version,
            lastMutationID: lastMutationID,
          },
        })
        .execute(),
    );
  }
  return queries;
};
