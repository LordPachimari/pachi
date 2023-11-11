import { and, eq, gt } from "drizzle-orm";

import { replicache_clients, type Transaction } from "@pachi/db";

export const getLastMutationIDChanges = async ({
  clientVersion,
  transaction,
  clientGroupID,
}: {
  clientVersion: number;
  clientGroupID: string;
  transaction: Transaction;
}): Promise<Record<string, number>> => {
  const result = await transaction
    .select({
      id: replicache_clients.id,
      lastMutationID: replicache_clients.lastMutationID,
    })
    .from(replicache_clients)
    .where(
      and(
        eq(replicache_clients.clientGroupID, clientGroupID),
        gt(replicache_clients.version, clientVersion),
      ),
    )
    .execute();
  const keys = Object.fromEntries(
    result.map((l) => [l.id, l.lastMutationID] as const),
  );
  return keys;
};
