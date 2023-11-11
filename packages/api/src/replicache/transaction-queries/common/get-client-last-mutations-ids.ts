import { and, eq, inArray } from "drizzle-orm";

import { replicache_clients } from "@pachi/db";
import type { Transaction } from "@pachi/db";

export const getClientLastMutationIdAndVersion_ = async ({
  clientIDs,
  transaction,
  clientGroupID,
}: {
  clientIDs: string[];
  clientGroupID: string;
  transaction: Transaction;
}): Promise<Record<string, { lastMutationID: number; version: number }>> => {
  console.log("client ids and group", clientIDs, clientGroupID);
  const result = await transaction
    .select({
      id: replicache_clients.id,
      version: replicache_clients.version,
      lastMutationID: replicache_clients.lastMutationID,
    })
    .from(replicache_clients)
    .where(
      and(
        eq(replicache_clients.clientGroupID, clientGroupID),
        inArray(replicache_clients.id, clientIDs),
      ),
    )
    .execute();
  const keys = Object.fromEntries(
    result.map((l) => [
      l.id,
      { lastMutationID: l.lastMutationID, version: l.version },
    ]),
  );
  return keys;
};
