import { Effect } from "effect";

import { replicacheClients } from "@pachi/db/schema";
import { UnknownExceptionLogger } from "@pachi/utils";
import { AuthorizationError, type ReplicacheClient } from "@pachi/validators";

import { Database } from "..";

function getClientByID({
  clientID,
  clientGroupID,
}: {
  clientID: string;
  clientGroupID: string;
}) {
  return Effect.gen(function* (_) {
    const { transaction } = yield* _(Database);

    const client = yield* _(
      Effect.tryPromise(() =>
        transaction.query.replicacheClients.findFirst({
          where: (client, { eq }) => eq(client.id, clientID),
        }),
      ).pipe(
        Effect.orDieWith((e) => UnknownExceptionLogger(e, "GET CLIENT ERROR")),
      ),
    );

    if (!client)
      return {
        id: clientID,
        clientGroupID: "",
        lastMutationID: 0,
      };

    if (client.clientGroupID !== clientGroupID) {
      yield* _(
        Effect.fail(
          new AuthorizationError({ message: "CLIENT GROUP DOES NOT MATCH" }),
        ),
      );
    }

    return client;
  });
}

function setClient(client: ReplicacheClient) {
  return Effect.gen(function* (_) {
    const { transaction } = yield* _(Database);

    return Effect.tryPromise(() =>
      transaction
        .insert(replicacheClients)
        //@ts-ignore
        .values(client)
        .onConflictDoUpdate({
          target: replicacheClients.id,
          set: {
            lastMutationID: client.lastMutationID,
          },
        }),
    ).pipe(
      Effect.orDieWith((e) => UnknownExceptionLogger(e, "SET CLIENT ERROR")),
    );
  });
}

export { getClientByID, setClient };
