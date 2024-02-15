import { Effect } from "effect";
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
import { pullRequestSchema } from "@pachi/types";
import { withDieErrorLogger } from "@pachi/utils";

export const pull = ({
  spaceId,
  body,
  userId,
  db,
}: {
  spaceId: SpaceId;
  body: PullRequest;
  userId: string | undefined;
  db: Db;
}) =>
  Effect.gen(function* (_) {
    yield* _(
      Effect.log("----------------------------------------------------"),
    );
    yield* _(
      Effect.log(`Processing mutation pull: ${JSON.stringify(body, null, "")}`),
    );

    const pull = pullRequestSchema.safeParse(body);
    if (pull.success === false) {
      return yield* _(Effect.fail(pull.error));
    }

    const requestCookie = pull.data.cookie;

    const startTransact = Date.now();

    const spaceRecordKey =
      requestCookie && spaceId === "global"
        ? requestCookie.globalSpaceRecordKey
        : requestCookie && spaceId === "dashboard"
        ? requestCookie.dashboardSpaceRecordKey
        : undefined;

    const processPull = yield* _(
      Effect.tryPromise(() =>
        db.transaction(
          async (transaction) =>
            Effect.gen(function* (_) {
              const [prevSpaceRecord, clientGroupObject] = yield* _(
                Effect.all(
                  [
                    getPrevSpaceRecord({
                      key: spaceRecordKey,
                      transaction,
                      spaceId,
                    }),
                    getClientGroupObject({
                      clientGroupID: pull.data.clientGroupID,
                      transaction,
                    }),
                  ],
                  {
                    concurrency: "unbounded",
                  },
                ),
              );

              const patchEffect = getPatch({
                spaceRecord: prevSpaceRecord,
                spaceId,
                userId,
                transaction,
              });

              const lastMutationIDsEffect = getLastMutationIdsSince({
                clientGroupID: pull.data.clientGroupID,
                clientVersion: clientGroupObject.clientVersion,
                transaction,
              });
              const [{ newSpaceRecord, patch }, { lastMutationIDChanges }] =
                yield* _(
                  Effect.all([patchEffect, lastMutationIDsEffect], {
                    concurrency: "unbounded",
                  }),
                );

              // Replicache ClientGroups can be forked from an existing
              // ClientGroup with existing state and cookie. In this case we
              // might see a new CG getting a pull with a non-null cookie.
              // For these CG's, initialize to incoming cookie.
              const prevSpaceRecordVersion =
                clientGroupObject.spaceRecordVersion ??
                requestCookie?.order ??
                0;
              const nextSpaceRecordVersion = prevSpaceRecordVersion + 1;
              clientGroupObject.spaceRecordVersion = nextSpaceRecordVersion;

              const newSpaceRecordKey = makeSpaceRecordKey({
                clientGroupID: clientGroupObject.id,
                order: nextSpaceRecordVersion,
                spaceId,
              });

              const nothingToUpdate =
                patch.length === 0 &&
                Object.keys(lastMutationIDChanges).length === 0;

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
              yield* _(Effect.log(`pull response ${JSON.stringify(resp)}`));
              if (!nothingToUpdate) {
                yield* _(
                  Effect.all(
                    [
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
                    ],
                    {
                      concurrency: "unbounded",
                    },
                  ),
                );
              }
              return resp;
            }),
          { isolationLevel: "serializable", accessMode: "read write" },
        ),
      ).pipe(
        Effect.orDieWith((e) => withDieErrorLogger(e, "transaction error")),
      ),
    );

    const response = yield* _(processPull);

    yield* _(Effect.log(`total time ${Date.now() - startTransact}`));

    yield* _(
      Effect.log("----------------------------------------------------"),
    );

    return response;
  });
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
