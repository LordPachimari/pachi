import {
  getClientGroupObject,
  getClientLastMutationIdsAndVersion,
  ReplicacheTransaction,
  server,
  setClientGroupObject,
  setLastMutationIdsAndVersions,
  type Server,
} from "@pachi/core";
import type { Db } from "@pachi/db";
import type {
  Mutation,
  PushRequest,
  RequestHeaders,
  SpaceId,
} from "@pachi/types";
import { mutationAffectedSpaces, pushRequestSchema } from "@pachi/types";

export const push = async ({
  body: push,
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
}): Promise<void> => {
  console.log("---------------------------------------------------");

  console.log("Processing push");
  try {
    pushRequestSchema.parse(push);
  } catch (error) {
    console.log(error);
    throw new Error("Invalid push request");
  }
  if (push.mutations.length === 0) {
    console.log("no mutations");
    return;
  }

  const affectedSpaces = new Map<SpaceId, Set<string>>();
  const t0 = Date.now();
  const clientIDs = [...new Set(push.mutations.map((m) => m.clientID))];

  const processMutations = async () => {
    await db.transaction(
      async (transaction) => {
        const clientGroupObject = await getClientGroupObject({
          clientGroupID: push.clientGroupID,
          transaction,
        });
        let clientVersion = clientGroupObject.clientVersion;
        const replicacheTransaction = new ReplicacheTransaction(
          spaceId,
          userId,
          transaction,
        );
        const repositories: server.Repositories = {
          productOptionRepository: new server.ProductOptionRepository(
            transaction,
          ),
          productRepository: new server.ProductRepository(transaction),
          productVariantRepository: new server.ProductVariantRepository(
            transaction,
          ),
          userRepository: new server.UserRepository(transaction),
          productTagRepository: new server.ProductTagRepository(transaction),
          storeRepository: new server.StoreRepository(transaction),
        };
        const services: server.Services = {
          cartService: new server.CartService({
            manager: transaction,
            replicacheTransaction,
          }),
        };
        const props: server.ServerProps = {
          transaction,
          userId,
          requestHeaders,
          services,
          repositories,
          replicacheTransaction,
        };

        const replicacheServer =
          spaceId === "dashboard"
            ? server.initDashboardServer(props)
            : undefined;
        const lastMutationIdsAndVersions =
          await getClientLastMutationIdsAndVersion({
            clientGroupID: push.clientGroupID,
            clientIDs,
            transaction,
          });
        let updated = false;

        console.log(
          "lastMutationIDs:",
          JSON.stringify(lastMutationIdsAndVersions),
        );
        console.log("clientId", clientIDs);

        for (const mutation of push.mutations) {
          if (!lastMutationIdsAndVersions[mutation.clientID]) {
            lastMutationIdsAndVersions[mutation.clientID] = {
              lastMutationID: 0,
              version: 0,
            };
          }

          const nextMutationId = await processMutation({
            lastMutationID:
              lastMutationIdsAndVersions[mutation.clientID]!.lastMutationID,
            mutation,
            replicacheServer: replicacheServer as Server<any>,
          });
          console.log("lastMutationID", lastMutationIdsAndVersions);

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
            console.log(
              "you forgot to add a mutationAffectedSpaces entry for",
              mutation.name,
            );
            throw new Error();
          }
          for (const [spaceId_, subspaces_] of Object.entries(spaces)) {
            const space = spaceId_ as SpaceId;
            const affectedSubSpaces = affectedSpaces.get(space) ?? new Set();

            for (const subspace of subspaces_) {
              affectedSubSpaces.add(subspace);
            }

            console.log("affected set", affectedSubSpaces);
            affectedSpaces.set(space, affectedSubSpaces);
          }
        }
        if (updated) {
          await Promise.all([
            setLastMutationIdsAndVersions({
              clientGroupID: push.clientGroupID,
              lastMutationIdsAndVersions,
              transaction,
            }),
            setClientGroupObject({
              clientGroupObject: { ...clientGroupObject, clientVersion },
              transaction,
            }),
            replicacheTransaction.flush(),
          ]);
        } else {
          console.log("Nothing to update");
        }
      },
      { isolationLevel: "repeatable read", accessMode: "read write" },
    );
  };

  await processMutations();
  console.log("affected spaces", affectedSpaces);

  // if (affectedRooms.size === 1 && affectedRooms.has(spaceId)) {
  //   space.broadcast(push.clientGroupID);
  // } else {
  //   for (const affectedRoom of affectedRooms) {
  //     if (affectedRoom === space.id) {
  //       space.broadcast(push.clientGroupID);
  //     } else {
  //       const websocket = await space.parties.push
  //         ?.get(affectedRoom)
  //         .connect();
  //       if (websocket) {
  //         websocket.send(push.clientGroupID);
  //       }
  //     }
  //   }
  // }
  console.log("Processed all mutations in", Date.now() - t0);
};

const processMutation = async ({
  mutation,
  error,
  lastMutationID,
  replicacheServer,
}: {
  mutation: Mutation;
  lastMutationID: number;
  error?: unknown;
  replicacheServer: Server<any>;
}) => {
  const expectedMutationID = lastMutationID + 1;
  if (mutation.id < expectedMutationID) {
    console.log(
      `Mutation ${mutation.id} has already been processed - skipping`,
    );
    return lastMutationID;
  }
  if (mutation.id > expectedMutationID) {
    console.warn(`Mutation ${mutation.id} is from the future - aborting`);

    throw new Error(`Mutation ${mutation.id} is from the future - aborting`);
  }

  if (!error) {
    console.log("Processing mutation:", JSON.stringify(mutation, null, ""));

    const t1 = Date.now();
    // For each possible mutation, run the server-side logic to apply the
    // mutation.
    const { name, args } = mutation;

    try {
      await replicacheServer.execute(name, args);
    } catch (e) {
      console.error(`Error executing mutator: ${JSON.stringify(mutation)}`, e);
    }
    console.log("Processed mutation in", Date.now() - t1);

    console.log("----------------------------------------------------");

    return expectedMutationID;
  } else {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
    console.log(
      "Handling error from mutation",
      JSON.stringify(mutation),
      error,
    );
    return lastMutationID;
  }
};
