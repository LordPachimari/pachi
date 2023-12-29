import { and, eq, inArray } from "drizzle-orm";

import type { Transaction } from "@pachi/db";
import { replicacheClients } from "@pachi/db/schema";

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
      id: replicacheClients.id,
      version: replicacheClients.version,
      lastMutationID: replicacheClients.lastMutationID,
    })
    .from(replicacheClients)
    .where(
      and(
        eq(replicacheClients.clientGroupID, clientGroupID),
        inArray(replicacheClients.id, clientIDs),
      ),
    );
  const keys = Object.fromEntries(
    result.map((l) => [
      l.id,
      { lastMutationID: l.lastMutationID, version: l.version },
    ]),
  );
  return keys;
};
