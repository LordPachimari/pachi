import { and, eq, inArray } from "drizzle-orm";
import { Effect } from "effect";

import type { Transaction } from "@pachi/db";
import { replicacheClients } from "@pachi/db/schema";
import { withDieErrorLogger } from "@pachi/utils";

export const getClientLastMutationIdAndVersion_ = ({
  clientIDs,
  transaction,
  clientGroupID,
}: {
  clientIDs: string[];
  clientGroupID: string;
  transaction: Transaction;
}): Effect.Effect<
  Map<string, { lastMutationID: number; version: number }>,
  never,
  never
> =>
  Effect.gen(function* (_) {
    const result = yield* _(
      Effect.tryPromise(() =>
        transaction
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
          ),
      ).pipe(
        Effect.orDieWith((e) =>
          withDieErrorLogger(e, "getClientLastMutationIdAndVersion error"),
        ),
      ),
    );
    const keys = new Map(
      result.map((l) => [
        l.id,
        { lastMutationID: l.lastMutationID, version: l.version },
      ]),
    );
    return keys;
  });
