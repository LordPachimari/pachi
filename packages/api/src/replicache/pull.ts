import { Clock, Effect } from "effect";
import type { PullResponseOKV1 } from "replicache";

import { ReplicacheRecordManager } from "@pachi/core";
import type { Db } from "@pachi/db";
import { ulid, UnknownExceptionLogger } from "@pachi/utils";
import type { Cookie, PullRequest, SpaceID, SpaceRecord } from "@pachi/validators";

export const pull = <T extends SpaceID>({
  spaceID,
  body: pull,
  userID,
  db,
  subspaceIDs,
}: {
  spaceID: T;
  subspaceIDs: Array<SpaceRecord[T][number]>;
  body: PullRequest;
  userID: string | undefined;
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
              // 3: INIT REPLICACHE
              const REPLICACHE = new ReplicacheRecordManager({
                clientGroupID: pull.clientGroupID,
                spaceID,
                subspaceIDs,
                transaction,
                userID,
              });
              // 4: GET PREVIOUS AND CURRENT RECORDS. (1 ROUND TRIP TO THE DATABASE)
              const [
                prevSpaceRecord,
                prevClientRecord,
                currentSpaceRecord,
                currentClientRecord,
                clientGroupObject,
              ] = yield* _(
                Effect.all(
                  [
                    REPLICACHE.getPrevSpaceRecord(spaceRecordKey),
                    REPLICACHE.getPrevClientRecord(
                      requestCookie?.clientRecordKey,
                    ),
                    REPLICACHE.getCurrentSpaceRecord(),
                    REPLICACHE.getCurrentClientRecord(),
                    REPLICACHE.getClientGroupObject(),
                  ],
                  {
                    concurrency: "unbounded",
                  },
                ),
              );

              const currentTime = yield* _(Clock.currentTimeMillis);

              yield* _(
                Effect.log(
                  `TOTAL TIME OF GETTING RECORDS ${
                    currentTime - startTransact
                  }`,
                ),
              );

              // 5: GET RECORDS DIFF
              const [spaceDiff, clientDiff] = yield* _(
                Effect.all([
                  REPLICACHE.diffSpaceRecords(
                    prevSpaceRecord,
                    currentSpaceRecord,
                  ),
                  REPLICACHE.diffClientRecords(
                    prevClientRecord,
                    currentClientRecord,
                  ),
                ]),
              );

              // 5: GET THE PATCH: THE DIFF TO THE SPACE RECORD. (2 ROUND TRIP TO THE DATABASE)
              // IF PREVIOUS SPACE RECORD IS NOT FOUND, THEN RESET THE SPACE RECORD

              const spacePatch = prevSpaceRecord
                ? yield* _(REPLICACHE.createSpacePatch(spaceDiff))
                : yield* _(REPLICACHE.createSpaceResetPatch());

              // 6: PREPARE UPDATES
              const prevSpaceRecordVersion = Math.max(
                clientGroupObject.spaceRecordVersion,
                requestCookie?.order ?? 0,
              );
              const nextSpaceRecordVersion = prevSpaceRecordVersion + 1;
              clientGroupObject.spaceRecordVersion = nextSpaceRecordVersion;

              const newSpaceRecordKey = ulid();

              const nothingToUpdate =
                spacePatch.length === 0 && Object.keys(clientDiff).length === 0;

              // 7: CREATE THE PULL RESPONSE
              const resp: PullResponseOKV1 = {
                lastMutationIDChanges: clientDiff,
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
                patch: spacePatch,
              };
              yield* _(Effect.log(`pull response ${JSON.stringify(resp)}`));

              // 8: UPDATE RECORDS IF THERE ARE CHANGES. (3 ROUND TRIP TO THE DATABASE)
              if (!nothingToUpdate) {
                yield* _(
                  Effect.all(
                    [
                      REPLICACHE.setSpaceRecord(
                        currentSpaceRecord.map(
                          (record) => record.subspaceRecord,
                        ),
                      ),
                      REPLICACHE.setClientGroupObject(clientGroupObject),
                      REPLICACHE.deleteSpaceRecord(
                        prevSpaceRecord ? prevSpaceRecord.map((r) => r.id) : [],
                      ),
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

    yield* _(Effect.log(`TOTAL TIME ${endTransact - startTransact}`));

    yield* _(
      Effect.log("----------------------------------------------------"),
    );

    return response;
  });
