import { Clock, Effect } from "effect";
import type { PullResponseOKV1 } from "replicache";

import {
  deleteSpaceRecord,
  getClientChanges,
  getClientGroupObject,
  getPrevClientRecord,
  getPrevSpaceRecord,
  getSpacePatch,
  setClientGroupObject,
  setSpaceRecord,
  type Cookie,
  type PullRequest,
  type SpaceId,
  type SpaceRecords,
} from "@pachi/core";
import type { Db } from "@pachi/db";
import { ulid, UnknownExceptionLogger } from "@pachi/utils";

export const pull = <T extends SpaceId>({
  spaceID,
  body: pull,
  userId,
  db,
  subspaceIDs,
}: {
  spaceID: T;
  subspaceIDs: (keyof SpaceRecords[T])[] | undefined;
  body: PullRequest;
  userId: string | undefined;
  db: Db;
}) =>
  Effect.gen(function* (_) {
    yield* _(
      Effect.log("----------------------------------------------------"),
    );

    yield* _(Effect.log(`PROCESSING PULL: ${JSON.stringify(pull, null, "")}`));

    const requestCookie = pull.cookie;
    const startTransact = yield* _(Clock.currentTimeMillis);

    // 1: GET SPACE RECORD KEY: TO RETRIEVE PREVIOUS SPACE RECORD
    const spaceRecordKey =
      requestCookie && spaceID === "global"
        ? requestCookie.globalSpaceRecordKey
        : requestCookie && spaceID === "dashboard"
        ? requestCookie.dashboardSpaceRecordKey
        : undefined;

    // 2: BEGIN PULL TRANSACTION
    const processPull = yield* _(
      Effect.tryPromise(() =>
        db.transaction(
          async (transaction) =>
            Effect.gen(function* (_) {
              // 3: GET PREVIOUS SPACE RECORD, CLIENT RECORD, AND CLIENT GROUP OBJECT
              const [prevSpaceRecord, prevClientRecord, clientGroupObject] =
                yield* _(
                  Effect.all(
                    [
                      getPrevSpaceRecord({
                        key: spaceRecordKey,
                        transaction,
                        spaceID,
                      }),
                      getPrevClientRecord({
                        transaction,
                        key: requestCookie?.clientRecordKey,
                      }),
                      getClientGroupObject({
                        clientGroupID: pull.clientGroupID,
                        transaction,
                      }),
                    ],
                    {
                      concurrency: "unbounded",
                    },
                  ),
                );

              const currentTime = yield* _(Clock.currentTimeMillis);

              yield* _(
                Effect.log(
                  `TOTAL TIME OF GETTING PREVIOUS RECORDS ${
                    currentTime - startTransact
                  }`,
                ),
              );

              const patchEffect = getSpacePatch({
                spaceRecord: prevSpaceRecord,
                spaceID,
                userId,
                transaction,
                subspaceIDs,
              });

              const lastMutationIDChangesEffect = getClientChanges({
                clientRecord: prevClientRecord,
                transaction,
              });

              // 3: get the patch: the changes to the space record since the last pull
              // and the lastMutationIDChanges: the changes to the client record since the last pull
              const [{ newSpaceRecord, patch }, lastMutationIDChanges] =
                yield* _(
                  Effect.all([patchEffect, lastMutationIDChangesEffect], {
                    concurrency: "unbounded",
                  }),
                );

              // Replicache ClientGroups can be forked from an existing
              // ClientGroup with existing state and cookie. In this case we
              // might see a new CG getting a pull with a non-null cookie.
              // For these CG's, initialize to incoming cookie.
              const prevSpaceRecordVersion = Math.max(
                clientGroupObject.spaceRecordVersion,
                requestCookie?.order ?? 0,
              );
              const nextSpaceRecordVersion = prevSpaceRecordVersion + 1;
              clientGroupObject.spaceRecordVersion = nextSpaceRecordVersion;

              const newSpaceRecordKey = ulid();

              const nothingToUpdate =
                patch.length === 0 &&
                Object.keys(lastMutationIDChanges).length === 0;

              const resp: PullResponseOKV1 = {
                lastMutationIDChanges,
                cookie: {
                  ...requestCookie,
                  ...(spaceID === "global" && {
                    globalSpaceRecordKey: nothingToUpdate
                      ? spaceRecordKey
                      : newSpaceRecordKey,
                  }),
                  ...(spaceID === "dashboard" && {
                    dashboardSpaceRecordKey: nothingToUpdate
                      ? spaceRecordKey
                      : newSpaceRecordKey,
                  }),
                  order: nothingToUpdate
                    ? prevSpaceRecordVersion
                    : nextSpaceRecordVersion,
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
        Effect.orDieWith((e) =>
          UnknownExceptionLogger(e, "TRANSACTION ERROR IN PULL"),
        ),
      ),
    );

    const response = yield* _(processPull);

    const endTransact = yield* _(Clock.currentTimeMillis);

    yield* _(Effect.log(`total time ${endTransact - startTransact}`));

    yield* _(
      Effect.log("----------------------------------------------------"),
    );

    return response;
  });
