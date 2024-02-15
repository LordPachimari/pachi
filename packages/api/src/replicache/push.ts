/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Effect, Either } from "effect";
import { forEachObj } from "remeda";

import {
  getClientGroupObject,
  getClientLastMutationIdsAndVersion,
  ReplicacheTransaction,
  server,
  ServerDashboardMutatorsMap,
  ServerGlobalMutatorsMap,
  setClientGroupObject,
  setLastMutationIdsAndVersions,
  type ServerDashboardMutatorsMapType,
  type ServerGlobalMutatorsMapType,
} from "@pachi/core";
import { ServerContext } from "@pachi/core/src/context/server";
import type { Db } from "@pachi/db";
import type {
  Mutation,
  PushRequest,
  RequestHeaders,
  SpaceId,
} from "@pachi/types";
import {
  InternalError,
  mutationAffectedSpaces,
  pushRequestSchema,
} from "@pachi/types";
import { generateId, ulid } from "@pachi/utils";

export const push = ({
  body,
  userId,
  db,
  spaceId,
  requestHeaders,
}: {
  body: PushRequest;
  userId: string | undefined;
  db: Db;
  spaceId: SpaceId;
  requestHeaders: RequestHeaders;
}) =>
  Effect.gen(function* (_) {
    console.log("---------------------------------------------------");

    const push = pushRequestSchema.safeParse(body);
    if (push.success === false) return yield* _(Effect.fail(push.error));
    if (push.data.mutations.length === 0) {
      return;
    }

    const affectedSpaces = new Map<SpaceId, Set<string>>();
    const t0 = Date.now();
    const clientIDs = [...new Set(push.data.mutations.map((m) => m.clientID))];

    const processMutations = yield* _(
      Effect.tryPromise(() =>
        db.transaction(
          async (transaction) =>
            Effect.gen(function* (_) {
              const clientGroupObject = yield* _(
                getClientGroupObject({
                  clientGroupID: push.data.clientGroupID,
                  transaction,
                }),
              );
              let clientVersion = clientGroupObject.clientVersion;
              const replicacheTransaction = new ReplicacheTransaction(
                spaceId,
                userId,
                transaction,
              );

              const mutators =
                spaceId === "dashboard"
                  ? ServerDashboardMutatorsMap
                  : ServerGlobalMutatorsMap;
              const lastMutationIdsAndVersions = yield* _(
                getClientLastMutationIdsAndVersion({
                  clientGroupID: push.data.clientGroupID,
                  clientIDs,
                  transaction,
                }),
              );
              let updated = false;

              for (const mutation of push.data.mutations) {
                if (!lastMutationIdsAndVersions[mutation.clientID]) {
                  lastMutationIdsAndVersions[mutation.clientID] = {
                    lastMutationID: 0,
                    version: 0,
                  };
                }

                const processMutationWithContext = Effect.provideService(
                  processMutation({
                    lastMutationID:
                      lastMutationIdsAndVersions[mutation.clientID]!
                        .lastMutationID,
                    mutation,
                    mutators,
                  }),
                  ServerContext,
                  ServerContext.of({
                    replicacheTransaction,
                    manager: transaction,
                    repositories: server.Repositories,
                    requestHeaders,
                    services: server.Services,
                    userId,
                  }),
                );

                const nextMutationId = yield* _(processMutationWithContext);

                clientVersion++;

                if (
                  nextMutationId >
                  lastMutationIdsAndVersions[mutation.clientID]!.lastMutationID
                ) {
                  updated = true;
                }
                lastMutationIdsAndVersions[mutation.clientID] = {
                  lastMutationID: nextMutationId,
                  version: clientVersion,
                };
                const spaces = mutationAffectedSpaces[mutation.name];
                if (spaces === undefined) {
                  Effect.logWarning(
                    `you forgot to add a mutationAffectedSpaces entry for ${mutation.name}`,
                  );
                  Effect.fail(
                    new InternalError({
                      message: `you forgot to add a mutationAffectedSpaces entry for ${mutation.name}`,
                    }),
                  );
                }
                forEachObj.indexed(spaces, (subspaces, space) => {
                  const affectedSubSpaces =
                    affectedSpaces.get(space) ?? new Set();

                  for (const subspace of subspaces) {
                    affectedSubSpaces.add(subspace);
                  }
                  affectedSpaces.set(space, affectedSubSpaces);
                });
                if (updated) {
                  yield* _(
                    Effect.all(
                      [
                        setLastMutationIdsAndVersions({
                          clientGroupID: push.data.clientGroupID,
                          lastMutationIdsAndVersions,
                          transaction,
                        }),
                        setClientGroupObject({
                          clientGroupObject: {
                            ...clientGroupObject,
                            clientVersion,
                          },
                          transaction,
                        }),
                        replicacheTransaction.flush(),
                      ],
                      {
                        concurrency: "unbounded",
                      },
                    ),
                  );
                } else {
                  yield* _(Effect.log("Nothing to update"));
                }
              }
            }),
          { isolationLevel: "serializable", accessMode: "read write" },
        ),
      ).pipe(Effect.orDie),
    );

    yield* _(processMutations);

    //TODO: send poke
    yield* _(Effect.log(`Processed all mutations in ${Date.now() - t0}`));
  });

const processMutation = ({
  mutation,
  error,
  lastMutationID,
  mutators,
}: {
  mutation: Mutation;
  lastMutationID: number;
  error?: unknown;
  mutators: ServerDashboardMutatorsMapType | ServerGlobalMutatorsMapType;
}) =>
  Effect.gen(function* (_) {
    const expectedMutationID = lastMutationID + 1;
    if (mutation.id < expectedMutationID) {
      yield* _(
        Effect.log(
          `Mutation ${mutation.id} has already been processed - skipping`,
        ),
      );
      return lastMutationID;
    }
    if (mutation.id > expectedMutationID) {
      yield* _(
        Effect.logWarning(
          `Mutation ${mutation.id} is from the future - aborting`,
        ),
      );

      yield* _(
        Effect.fail(
          new InternalError({
            message: `Mutation ${mutation.id} is from the future - aborting`,
          }),
        ),
      );
    }

    if (!error) {
      yield* _(
        Effect.log(
          `Processing mutation: ${JSON.stringify(mutation, null, "")}`,
        ),
      );
      const t1 = Date.now();

      const { name, args } = mutation;

      const mutator = mutators.get(name);
      if (!mutator) {
        yield* _(
          Effect.fail(
            new InternalError({
              message: `No mutator found for ${name}`,
            }),
          ),
        );
        return lastMutationID;
      }
      const result = yield* _(Effect.either(mutator(args)));
      if (Either.isLeft(result)) {
        const error = result.left;
        if (error._tag === "NotFound") {
          yield* _(Effect.logError(error.message));
          yield* _(
            server.Error.createError({
              id: generateId({ prefix: "error", id: ulid() }),
              type: "NotFound",
              message: error.message,
            }).pipe(Effect.orDie),
          );
        }
      } else {
        result.right;
      }
      yield* _(Effect.log(`Processed mutation in ${Date.now() - t1}`));

      return expectedMutationID;
    } else {
      // TODO: You can store state here in the database to return to clients to
      // provide additional info about errors.
      yield* _(
        Effect.log(`Handling error from mutation ${JSON.stringify(mutation)} `),
      );
      return lastMutationID;
    }
  });
