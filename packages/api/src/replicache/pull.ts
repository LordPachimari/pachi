import { Effect } from "effect"
import type { PullResponseOKV1 } from "replicache"
import { z } from "zod"

import {
  deleteSpaceRecord,
  getClientChanges,
  getClientGroupObject,
  getPrevClientRecord,
  getPrevSpaceRecord,
  getSpacePatch,
  setClientGroupObject,
  setSpaceRecord,
} from "@pachi/core"
import type { Db } from "@pachi/db"
import type { Cookie, PullRequest, SpaceId, SpaceRecords } from "@pachi/types"
import { pullRequestSchema } from "@pachi/types"
import { withDieErrorLogger } from "@pachi/utils"

const subspacesSchema = z.enum(["store", "user"] as const)
export const pull = <T extends SpaceId>({
  spaceId,
  body,
  userId,
  db,
  subspaceIds,
}: {
  spaceId: T
  subspaceIds: (keyof SpaceRecords[T])[] | undefined
  body: PullRequest
  userId: string | undefined
  db: Db
}) =>
  Effect.gen(function* (_) {
    yield* _(Effect.log("----------------------------------------------------"))
    yield* _(
      Effect.log(`Processing mutation pull: ${JSON.stringify(body, null, "")}`),
    )

    //parsing
    const pull = pullRequestSchema.safeParse(body)
    const parsedSubspaceIds = subspacesSchema.optional().safeParse(subspaceIds)
    if (pull.success === false) {
      return yield* _(Effect.fail(pull.error))
    }
    if (parsedSubspaceIds.success === false) {
      return yield* _(Effect.fail(parsedSubspaceIds.error))
    }

    const requestCookie = pull.data.cookie

    const startTransact = Date.now()

    // 1: get the space record key, to retrieve the previous space record
    const spaceRecordKey =
      requestCookie && spaceId === "global"
        ? requestCookie.globalSpaceRecordKey
        : requestCookie && spaceId === "dashboard"
        ? requestCookie.dashboardSpaceRecordKey
        : undefined

    // 2: begin transaction
    const processPull = yield* _(
      Effect.tryPromise(() =>
        db.transaction(
          async (transaction) =>
            Effect.gen(function* (_) {
              // 3: get previous space record and previous client record, and client group object
              const [prevSpaceRecord, prevClientRecord, clientGroupObject] =
                yield* _(
                  Effect.all(
                    [
                      getPrevSpaceRecord({
                        key: spaceRecordKey,
                        transaction,
                        spaceId,
                      }),
                      getPrevClientRecord({
                        transaction,
                        key: requestCookie?.clientRecordKey,
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
                )
              yield* _(
                Effect.log(
                  `total time getting prev records ${
                    Date.now() - startTransact
                  }`,
                ),
              )

              const patchEffect = getSpacePatch({
                spaceRecord: prevSpaceRecord,
                spaceId,
                userId,
                transaction,
                subspaceIds: parsedSubspaceIds.data as
                  | (keyof SpaceRecords[T])[]
                  | undefined,
              })

              const lastMutationIDChangesEffect = getClientChanges({
                clientRecord: prevClientRecord,
                transaction,
              })

              // 3: get the patch: the changes to the space record since the last pull
              // and the lastMutationIDChanges: the changes to the client record since the last pull
              const [{ newSpaceRecord, patch }, lastMutationIDChanges] =
                yield* _(
                  Effect.all([patchEffect, lastMutationIDChangesEffect], {
                    concurrency: "unbounded",
                  }),
                )

              // Replicache ClientGroups can be forked from an existing
              // ClientGroup with existing state and cookie. In this case we
              // might see a new CG getting a pull with a non-null cookie.
              // For these CG's, initialize to incoming cookie.
              const prevSpaceRecordVersion = Math.max(
                clientGroupObject.spaceRecordVersion,
                requestCookie?.order ?? 0,
              )
              const nextSpaceRecordVersion = prevSpaceRecordVersion + 1
              clientGroupObject.spaceRecordVersion = nextSpaceRecordVersion

              const newSpaceRecordKey = makeSpaceRecordKey({
                clientGroupID: clientGroupObject.id,
                order: nextSpaceRecordVersion,
                spaceId,
              })

              const nothingToUpdate =
                patch.length === 0 &&
                Object.keys(lastMutationIDChanges).length === 0

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
              }
              yield* _(Effect.log(`pull response ${JSON.stringify(resp)}`))
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
                )
              }
              return resp
            }),
          { isolationLevel: "serializable", accessMode: "read write" },
        ),
      ).pipe(
        Effect.orDieWith((e) => withDieErrorLogger(e, "transaction error")),
      ),
    )

    const response = yield* _(processPull)

    yield* _(Effect.log(`total time ${Date.now() - startTransact}`))

    yield* _(Effect.log("----------------------------------------------------"))

    return response
  })
function makeSpaceRecordKey({
  order,
  clientGroupID,
  spaceId,
}: {
  order: number
  clientGroupID: string
  spaceId: SpaceId
}) {
  return `${spaceId}/${clientGroupID}/${order}`
}
