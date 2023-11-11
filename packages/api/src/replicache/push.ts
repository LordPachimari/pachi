import type { MutatorReturn } from "replicache";
import { string } from "valibot";

import type { Db } from "@pachi/db";
import type {
  Mutation,
  PushRequest,
  RequestHeaders,
  SpaceId,
} from "@pachi/types";
import { mutationAffectedSpaces, pushRequestSchema } from "@pachi/types";

import type { Repositories } from "../repositories";
import { ProductRepository } from "../repositories/product";
import { ProductOptionRepository } from "../repositories/product-option";
import { ProductVariantRepository } from "../repositories/product-variant";
import type { Bindings } from "../types/bindings";
import {
  getClientGroupObject,
  getClientLastMutationIdsAndVersion,
  setClientGroupObject,
  setLastMutationIdsAndVersions,
} from "./data/data";
import {
  dashboardMutators_,
  globalMutators_,
  productMutators_,
} from "./mutators";
import { ReplicacheTransaction } from "./replicache-transaction/transaction";

type CustomMutator = Record<
  string,
  (
    tx: ReplicacheTransaction,
    props: {
      args: unknown;
      requestHeaders: RequestHeaders;
      userId?: string;
      repositories: Repositories;
      env: Bindings;
    },
  ) => MutatorReturn
>;

export const push = async ({
  body: push,
  userId,
  db,
  storage,
  spaceId,
  requestHeaders,
  env,
}: {
  body: PushRequest;
  userId: string;
  db: Db;
  storage: KVNamespace;
  spaceId: SpaceId;
  requestHeaders: {
    ip: string | null;
    userAgent: string | null;
  };
  env: Bindings;
}): Promise<void> => {
  console.log("---------------------------------------------------");

  console.log("Processing push");
  pushRequestSchema._parse(push);
  string()._parse(userId);
  if (push.mutations.length === 0) {
    console.log("no mutations");
    return;
  }

  const affectedSpaces = new Map<SpaceId, Set<string>>();
  const t0 = Date.now();
  const clientIDs = [...new Set(push.mutations.map((m) => m.clientID))];
  const clientGroupObject = await getClientGroupObject({
    clientGroupID: push.clientGroupID,
    storage,
  });
  console.log("getting from clientGroupObject cache time", Date.now() - t0);
  let clientVersion = clientGroupObject.clientVersion;

  const processMutations = async () => {
    await db.transaction(
      async (transaction) => {
        const repositories: Repositories = {
          product_option_repository: new ProductOptionRepository(transaction),
          product_repository: new ProductRepository(transaction),
          product_variant_repository: new ProductVariantRepository(transaction),
        };
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

        const tx = new ReplicacheTransaction(spaceId, userId, transaction);

        for (const mutation of push.mutations) {
          if (!lastMutationIdsAndVersions[mutation.clientID]) {
            lastMutationIdsAndVersions[mutation.clientID] = {
              lastMutationID: 0,
              version: 0,
            };
          }

          const nextMutationId = await processMutation({
            tx,
            lastMutationID:
              lastMutationIdsAndVersions[mutation.clientID]!.lastMutationID,
            mutation,
            storage,
            spaceId,
            requestHeaders,
            repositories,
            env,
            userId,
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
            console.log("space inside", space);
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
              clientGroupID: push.clientGroupID,
              clientGroupObject: { ...clientGroupObject, clientVersion },
              storage,
            }),
            tx.flush(),
          ]);
        } else {
          console.log("Nothing to update");
        }
      },
      { isolationLevel: "serializable", accessMode: "read write" },
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
  tx,
  mutation,
  error,
  userId,
  lastMutationID,
  spaceId,
  requestHeaders,
  repositories,
  env,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  lastMutationID: number;
  error?: unknown;
  userId: string;
  spaceId: SpaceId;
  storage: KVNamespace;
  requestHeaders: RequestHeaders;
  repositories: Repositories;
  env: Bindings;

  isFeatureEnabled?: (feature: string) => boolean;
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

    const mutator =
      spaceId === "products"
        ? (productMutators_ as CustomMutator)[mutation.name]
        : spaceId === "dashboard"
        ? (dashboardMutators_ as CustomMutator)[mutation.name]
        : (globalMutators_ as CustomMutator)[mutation.name];

    if (!mutator) {
      console.error(`Unknown mutator: ${mutation.name} - skipping`);
      return lastMutationID;
    }

    try {
      await mutator(tx, {
        args: mutation.args.args,
        requestHeaders,
        userId,
        repositories,
        env,
      });
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
