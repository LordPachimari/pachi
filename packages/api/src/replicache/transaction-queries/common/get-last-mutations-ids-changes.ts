import { and, eq, gt } from "drizzle-orm";

import { type Transaction } from "@pachi/db";
import { replicacheClients } from "@pachi/db/schema";

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
      id: replicacheClients.id,
      lastMutationID: replicacheClients.lastMutationID,
    })
    .from(replicacheClients)
    .where(
      and(
        eq(replicacheClients.clientGroupID, clientGroupID),
        gt(replicacheClients.version, clientVersion),
      ),
    );
  const keys = Object.fromEntries(
    result.map((l) => [l.id, l.lastMutationID] as const),
  );
  return keys;
};
