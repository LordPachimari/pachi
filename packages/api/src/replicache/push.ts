/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Clock, Effect } from "effect";

import {
  getClient,
  InternalError,
  ReplicacheTransaction,
  server,
  ServerDashboardMutatorsMap,
  ServerGlobalMutatorsMap,
  setClient,
  type Mutation,
  type PushRequest,
  type RequestHeaders,
  type ServerDashboardMutatorsMapType,
  type ServerGlobalMutatorsMapType,
  type SpaceID,
} from "@pachi/core";
import type { Db } from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

export const push = ({
  body: push,
  userId,
  db,
  spaceID,
  requestHeaders,
}: {
  body: PushRequest;
  userId: string | undefined;
  db: Db;
  spaceID: SpaceID;
  requestHeaders: RequestHeaders;
}) =>
  Effect.gen(function* (_) {
    console.log("---------------------------------------------------");

    const startTime = yield* _(Clock.currentTimeMillis);
    const mutators =
      spaceID === "dashboard"
        ? ServerDashboardMutatorsMap
        : ServerGlobalMutatorsMap;

    for (const mutation of push.mutations) {
      // 1: start transaction for each mutation
      Effect.tryPromise(() =>
        db.transaction(
          async (transaction) =>
            Effect.gen(function* (_) {
              const replicacheTransaction = new ReplicacheTransaction(
                userId,
                transaction,
              );
              // 2: get client row
              const baseClient = yield* _(
                getClient({
                  clientID: mutation.clientID,
                  transaction,
                  clientGroupID: push.clientGroupID,
                }).pipe(Effect.orDie),
              );

              let updated = false;

              //provide context to the effect
              const processMutationWithContext = Effect.provideService(
                processMutation({
                  lastMutationID: baseClient.lastMutationID,
                  mutation,
                  mutators,
                }),
                server.ServerContext,
                {
                  manager: transaction,
                  repositories: server.Repositories,
                  requestHeaders,
                  services: server.Services,
                  userId,
                  replicacheTransaction,
                },
              );

              // 3: process mutation
              const nextMutationId = yield* _(
                processMutationWithContext.pipe(Effect.orDie),
              );

              if (baseClient.lastMutationID > nextMutationId) {
                updated = true;
              }

              if (updated) {
                yield* _(
                  Effect.all([
                    setClient({
                      client: {
                        clientGroupID: push.clientGroupID,
                        id: mutation.clientID,
                        lastMutationID: nextMutationId,
                      },
                      transaction,
                    }),
                    replicacheTransaction.flush(),
                  ]),
                );
              } else {
                yield* _(Effect.log("Nothing to update"));
              }
            }),
          { isolationLevel: "serializable", accessMode: "read write" },
        ),
      ).pipe(Effect.orDie);
    }

    //TODO: send poke
    const endTime = yield* _(Clock.currentTimeMillis);
    yield* _(Effect.log(`Processed all mutations in ${endTime - startTime}`));
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

      yield* _(
        mutator(args).pipe(
          Effect.catchTag("NotFound", (error) => {
            server.Error.createError({
              id: generateId({ prefix: "error", id: ulid() }),
              type: "NotFound",
              message: error.message,
            }).pipe(Effect.orDie);

            return Effect.succeed(1);
          }),
        ),
      );

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
