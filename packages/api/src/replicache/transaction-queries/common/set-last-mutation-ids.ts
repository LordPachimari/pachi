import type { Transaction } from "@pachi/db";
import { replicacheClients } from "@pachi/db/schema";

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
        .insert(replicacheClients)
        .values({ id: key, lastMutationID, version: 1, clientGroupID })
        .onConflictDoUpdate({
          target: replicacheClients.id,
          set: {
            version,
            lastMutationID,
          },
        }),
    );
  }
  return queries;
};
