import { Clock, Effect, Layer } from "effect";

import {
  Database,
  ReplicacheClientRepository,
  Server,
  TableMutatorLive,
} from "@pachi/core";
import { tableNameToTableMap, type Db } from "@pachi/db";
import {
  InternalServerError,
  type Mutation,
  type PushRequest,
  type RequestHeaders,
  type SpaceID,
} from "@pachi/validators";

export const push = ({
  body: push,
  userID,
  db,
  spaceID,
}: {
  body: PushRequest;
  userID: string | undefined;
  db: Db;
  spaceID: SpaceID;
  requestHeaders: RequestHeaders;
}) =>
  Effect.gen(function* (_) {
    yield* _(
      Effect.log("----------------------------------------------------"),
    );

    const startTime = yield* _(Clock.currentTimeMillis);
    const mutators =
      spaceID === "dashboard"
        ? Server.DashboardMutatorsMap
        : Server.GlobalMutatorsMap;

    for (const mutation of push.mutations) {
      // 1: START TRANSACTION FOR EACH MUTATION
      Effect.tryPromise(() =>
        db.transaction(
          async (transaction) =>
            Effect.gen(function* (_) {
              // 2: GET CLIENT ROW
              const baseClient = yield* _(
                ReplicacheClientRepository.getClientByID({
                  clientGroupID: push.clientGroupID,
                  clientID: mutation.clientID,
                }),
              );

              let updated = false;

              const DatabaseLive = Layer.succeed(
                Database,
                Database.of({
                  transaction,
                  tableNameToTableMap,
                  userID,
                }),
              );

              const context = TableMutatorLive.pipe(
                Layer.provide(DatabaseLive),
              );

              // 3: PREPARE MUTATION
              const processMutationWithContext = Effect.provide(
                processMutation({
                  lastMutationID: baseClient.lastMutationID,
                  mutation,
                  mutators,
                }),
                context,
              );

              // 4: PROCESS MUTATION
              const nextMutationId = yield* _(
                processMutationWithContext.pipe(Effect.orDie),
              );

              if (baseClient.lastMutationID > nextMutationId) {
                updated = true;
              }

              if (updated) {
                yield* _(
                  ReplicacheClientRepository.setClient({
                    clientGroupID: push.clientGroupID,
                    id: mutation.clientID,
                    lastMutationID: nextMutationId,
                  }),
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
  mutators: Server.DashboardMutatorsMapType | Server.GlobalMutatorsMapType;
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
          new InternalServerError({
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
      const start = yield* _(Clock.currentTimeMillis);

      const { name, args } = mutation;

      const mutator = mutators.get(name);

      if (!mutator) {
        yield* _(
          Effect.fail(
            new InternalServerError({
              message: `No mutator found for ${name}`,
            }),
          ),
        );

        return lastMutationID;
      }

      //@ts-ignore
      yield* _(mutator(args));

      const end = yield* _(Clock.currentTimeMillis);

      yield* _(Effect.log(`Processed mutation in ${end - start}`));

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
