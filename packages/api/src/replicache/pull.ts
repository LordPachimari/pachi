import type { PullResponseOKV1 } from "replicache";
import { z } from "zod";

import {
  deleteSpaceRecord,
  getClientGroupObject,
  getLastMutationIdsSince,
  getPatch,
  getPrevSpaceRecord,
  setClientGroupObject,
  setSpaceRecord,
} from "@pachi/core";
import type { Db } from "@pachi/db";
import type { Cookie, PullRequest, SpaceId } from "@pachi/types";
import { cookieSchema, pullRequestSchema } from "@pachi/types";

export async function pull({
  spaceId,
  body,
  userId,
  db,
}: {
  spaceId: SpaceId;
  body: PullRequest;
  userId: string | undefined;
  db: Db;
}): Promise<PullResponseOKV1> {
  console.log("----------------------------------------------------");
  console.log("Processing mutation pull:", JSON.stringify(body, null, ""));

  const pull = pullRequestSchema.parse(body);
  z.string().parse(userId);

  const requestCookie = pull.cookie
    ? cookieSchema.parse(pull.cookie)
    : undefined;

  const startTransact = Date.now();

  const spaceRecordKey =
    requestCookie && spaceId === "global"
      ? requestCookie.globalSpaceRecordKey
      : requestCookie && spaceId === "dashboard"
      ? requestCookie.dashboardSpaceRecordKey
      : undefined;

  const processPull = async () => {
    const pullResult = await db.transaction(
      async (transaction) => {
        const [prevSpaceRecord, clientGroupObject] = await Promise.all([
          getPrevSpaceRecord({
            key: spaceRecordKey,
            transaction,
            spaceId,
          }),
          getClientGroupObject({
            clientGroupID: pull.clientGroupID,
            transaction,
          }),
        ]);

        console.log("Getting CVR time", Date.now() - startTransact);
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
        const [{ newSpaceRecord, patch }, { lastMutationIDChanges }] =
          await Promise.all([patchPromise, lastMutationIDsPromise]);

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
                transaction,
              }),
              setClientGroupObject({
                clientGroupObject,
                transaction,
              }),
              deleteSpaceRecord({ key: spaceRecordKey, transaction }),
            ]);
          } catch (error) {
            console.log(error);
          }
        }
        return resp;
      },
      { isolationLevel: "serializable", accessMode: "read write" },
    );
    return pullResult;
  };

  const response = await processPull();

  console.log("total time", Date.now() - startTransact);

  console.log("----------------------------------------------------");

  return response;
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
