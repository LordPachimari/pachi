import { and, eq, gt } from "drizzle-orm";
import { Effect } from "effect";

import { type Transaction } from "@pachi/db";
import { replicacheClients } from "@pachi/db/schema";
import { withDieErrorLogger } from "@pachi/utils";

export const getLastMutationIDChanges = ({
  clientVersion,
  transaction,
  clientGroupID,
}: {
  clientVersion: number;
  clientGroupID: string;
  transaction: Transaction;
}): Effect.Effect<never, never, Record<string, number>> =>
  Effect.gen(function* (_) {
    const result = yield* _(
      Effect.tryPromise(() =>
        transaction
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
          ),
      ).pipe(
        Effect.orDieWith((e) =>
          withDieErrorLogger(e, "getLastMutationIDChanges error"),
        ),
      ),
    );
    const keys = Object.fromEntries(
      result.map((l) => [l.id, l.lastMutationID] as const),
    );
    return keys;
  });
