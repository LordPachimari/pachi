import type { PullResponseOKV1 } from "replicache";
import { string } from "valibot";

import type { Db } from "@pachi/db";
import type { Cookie, PullRequest, SpaceId } from "@pachi/types";
import { cookieSchema, pullRequestSchema } from "@pachi/types";

import {
  deleteSpaceRecord,
  getClientGroupObject,
  getLastMutationIdsSince,
  getPatch,
  getPrevSpaceRecord,
  setClientGroupObject,
  setSpaceRecord,
} from "./data/data";

export async function pull({
  spaceId,
  body,
  userId,
  db,
  storage,
}: {
  spaceId: SpaceId;
  body: PullRequest;
  userId: string | undefined;
  db: Db;
  storage: KVNamespace;
}): Promise<PullResponseOKV1> {
  console.log("----------------------------------------------------");

  console.log("Processing mutation pull:", JSON.stringify(body, null, ""));

  const pull = pullRequestSchema._parse(body).output!;
  string()._parse(userId);

  const requestCookie = pull.cookie
    ? cookieSchema._parse(pull.cookie).output
    : undefined;

  const startTransact = Date.now();

  const spaceRecordKey =
    requestCookie && spaceId === "products"
      ? requestCookie.productsSpaceRecordKey
      : requestCookie && spaceId === "global"
      ? requestCookie.globalSpaceRecordKey
      : requestCookie && spaceId === "dashboard"
      ? requestCookie.dashboardSpaceRecordKey
      : undefined;
  console.log("spaceRecordKey", spaceRecordKey);
  const [prevSpaceRecord, clientGroupObject] = await Promise.all([
    getPrevSpaceRecord({
      key: spaceRecordKey,
      storage,
    }),
    getClientGroupObject({
      clientGroupID: pull.clientGroupID,
      storage,
    }),
  ]);

  console.log("Getting CVR time", Date.now() - startTransact);
  const processPull = async () => {
    const pullResult = await db.transaction(
      async (transaction) => {
        const patchPromise = getPatch({
          spaceRecord: prevSpaceRecord,
          spaceId,
          userId,
          transaction,
        });

        const lastMutationIDsPromise = getLastMutationIdsSince({
          clientGroupID: pull.clientGroupID,
          clientVersion: clientGroupObject.clientVersion,
          transaction,
        });

        return await Promise.all([patchPromise, lastMutationIDsPromise]);
      },
      { isolationLevel: "serializable", accessMode: "read write" },
    );
    return pullResult;
  };

  const [{ newSpaceRecord, patch }, { lastMutationIDChanges }] =
    await processPull();

  console.log("transact took", Date.now() - startTransact);

  console.log("prevSpaceRecord", JSON.stringify(prevSpaceRecord));
  console.log("newSpaceRecord", JSON.stringify(newSpaceRecord));
  console.log("lastMutationIDsChanges: ", lastMutationIDChanges);
  // Replicache ClientGroups can be forked from an existing
  // ClientGroup with existing state and cookie. In this case we
  // might see a new CG getting a pull with a non-null cookie.
  // For these CG's, initialize to incoming cookie.
  let prevSpaceRecordVersion = clientGroupObject.spaceRecordVersion;
  if (prevSpaceRecordVersion === 0) {
    if (requestCookie) {
      prevSpaceRecordVersion = requestCookie.order;
    }
    console.log(
      `ClientGroup ${pull.clientGroupID} is new, initializing to ${prevSpaceRecordVersion}`,
    );
  }
  const nextSpaceRecordVersion = prevSpaceRecordVersion + 1;
  clientGroupObject.spaceRecordVersion = nextSpaceRecordVersion;

  const newSpaceRecordKey = makeSpaceRecordKey({
    clientGroupID: clientGroupObject.id,
    order: nextSpaceRecordVersion,
    spaceId,
  });
  console.log("new space record key", newSpaceRecordKey);

  const nothingToUpdate =
    patch.length === 0 && Object.keys(lastMutationIDChanges).length === 0;
  console.log("nothingToUpdate", nothingToUpdate);

  const resp: PullResponseOKV1 = {
    lastMutationIDChanges,
    cookie: {
      ...requestCookie,
      ...(spaceId === "global" && {
        globalSpaceRecordKey: nothingToUpdate
          ? spaceRecordKey
          : newSpaceRecordKey,
      }),
      ...(spaceId === "products" && {
        productsSpaceRecordKey: nothingToUpdate
          ? spaceRecordKey
          : newSpaceRecordKey,
      }),
      ...(spaceId === "dashboard" && {
        dashboardSpaceRecordKey: nothingToUpdate
          ? spaceRecordKey
          : newSpaceRecordKey,
      }),
      order: nothingToUpdate
        ? prevSpaceRecordVersion
        : clientGroupObject.spaceRecordVersion,
    } satisfies Cookie,
    patch,
  };
  console.log("pull response", JSON.stringify(resp));
  if (!nothingToUpdate) {
    try {
      await Promise.allSettled([
        setSpaceRecord({
          spaceRecord: newSpaceRecord,
          key: newSpaceRecordKey,
          storage,
        }),
        setClientGroupObject({
          clientGroupID: clientGroupObject.id,
          clientGroupObject,
          storage,
        }),
        deleteSpaceRecord({ key: spaceRecordKey, storage }),
      ]);
    } catch (error) {
      console.log(error);
    }
  }
  console.log("total time", Date.now() - startTransact);

  console.log("----------------------------------------------------");

  return resp;
}
function makeSpaceRecordKey({
  order,
  clientGroupID,
  spaceId,
}: {
  order: number;
  clientGroupID: string;
  spaceId: SpaceId;
}) {
  return `${spaceId}/${clientGroupID}/${order}`;
}
