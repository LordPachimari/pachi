import { eq } from "drizzle-orm";

import { type Transaction } from "@pachi/db";
import { replicacheClients } from "@pachi/db/schema";

export const getLastMutationIDs = async ({
  clientGroupID,
  transaction,
}: {
  clientGroupID: string;
  transaction: Transaction;
}) => {
  const result = await transaction
    .select({
      id: replicacheClients.id,
      lastMutationID: replicacheClients.lastMutationID,
    })
    .from(replicacheClients)
    .where(eq(replicacheClients.clientGroupID, clientGroupID));
  return result;
};
