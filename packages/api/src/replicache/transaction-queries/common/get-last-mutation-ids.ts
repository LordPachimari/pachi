import { eq } from "drizzle-orm";

import { replicache_clients, type Transaction } from "@pachi/db";

export const getLastMutationIDs = async ({
  clientGroupID,
  transaction,
}: {
  clientGroupID: string;
  transaction: Transaction;
}) => {
  const result = await transaction
    .select({
      id: replicache_clients.id,
      lastMutationID: replicache_clients.lastMutationID,
    })
    .from(replicache_clients)
    .where(eq(replicache_clients.clientGroupID, clientGroupID))
    .execute();
  return result;
};
