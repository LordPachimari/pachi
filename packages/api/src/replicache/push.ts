/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Effect, Either } from 'effect'

import {
  getClient,
  getClientGroupObject,
  ReplicacheTransaction,
  server,
  ServerDashboardMutatorsMap,
  ServerGlobalMutatorsMap,
  setClient,
  type ServerDashboardMutatorsMapType,
  type ServerGlobalMutatorsMapType,
} from '@pachi/core'
import type { Db } from '@pachi/db'
import type {
  Mutation,
  PushRequest,
  RequestHeaders,
  SpaceId,
} from '@pachi/types'
import { InternalError, pushRequestSchema } from '@pachi/types'
import { generateId, ulid } from '@pachi/utils'

export const push = ({
  body,
  userId,
  db,
  spaceId,
  requestHeaders,
}: {
  body: PushRequest
  userId: string | undefined
  db: Db
  spaceId: SpaceId
  requestHeaders: RequestHeaders
}) =>
  Effect.gen(function* (_) {
    console.log('---------------------------------------------------')

    const push = pushRequestSchema.safeParse(body)
    if (push.success === false) return yield* _(Effect.fail(push.error))
    if (push.data.mutations.length === 0) {
      return
    }

    const t0 = Date.now()
    const mutators =
      spaceId === 'dashboard'
        ? ServerDashboardMutatorsMap
        : ServerGlobalMutatorsMap

    for (const mutation of push.data.mutations) {
      // 1: start transaction for each mutation
      Effect.tryPromise(() =>
        db.transaction(
          async (transaction) =>
            Effect.gen(function* (_) {
              const replicacheTransaction = new ReplicacheTransaction(
                userId,
                transaction,
              )
              // 2: check if user has access to the client group
              yield* _(
                getClientGroupObject({
                  clientGroupID: push.data.clientGroupID,
                  transaction,
                  userId,
                  //TODO: HANDLE ERROR
                }).pipe(Effect.orDie),
              )
              // 2: get client row
              const baseClient = yield* _(
                getClient({
                  clientID: mutation.clientID,
                  transaction,
                  clientGroupID: push.data.clientGroupID,
                }).pipe(Effect.orDie),
              )

              let updated = false

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
              )

              // 3: process mutation
              const nextMutationId = yield* _(
                processMutationWithContext.pipe(Effect.orDie),
              )

              if (baseClient.lastMutationID > nextMutationId) {
                updated = true
              }

              if (updated) {
                yield* _(
                  Effect.all([
                    setClient({
                      client: {
                        clientGroupID: push.data.clientGroupID,
                        id: mutation.clientID,
                        lastMutationID: nextMutationId,
                      },
                      transaction,
                    }),
                    replicacheTransaction.flush(),
                  ]),
                )
              } else {
                yield* _(Effect.log('Nothing to update'))
              }
            }),
          { isolationLevel: 'serializable', accessMode: 'read write' },
        ),
      ).pipe(Effect.orDie)
    }

    //TODO: send poke
    yield* _(Effect.log(`Processed all mutations in ${Date.now() - t0}`))
  })

const processMutation = ({
  mutation,
  error,
  lastMutationID,
  mutators,
}: {
  mutation: Mutation
  lastMutationID: number
  error?: unknown
  mutators: ServerDashboardMutatorsMapType | ServerGlobalMutatorsMapType
}) =>
  Effect.gen(function* (_) {
    const expectedMutationID = lastMutationID + 1
    if (mutation.id < expectedMutationID) {
      yield* _(
        Effect.log(
          `Mutation ${mutation.id} has already been processed - skipping`,
        ),
      )
      return lastMutationID
    }
    if (mutation.id > expectedMutationID) {
      yield* _(
        Effect.logWarning(
          `Mutation ${mutation.id} is from the future - aborting`,
        ),
      )

      yield* _(
        Effect.fail(
          new InternalError({
            message: `Mutation ${mutation.id} is from the future - aborting`,
          }),
        ),
      )
    }

    if (!error) {
      yield* _(
        Effect.log(
          `Processing mutation: ${JSON.stringify(mutation, null, '')}`,
        ),
      )
      const t1 = Date.now()

      const { name, args } = mutation

      const mutator = mutators.get(name)
      if (!mutator) {
        yield* _(
          Effect.fail(
            new InternalError({
              message: `No mutator found for ${name}`,
            }),
          ),
        )
        return lastMutationID
      }
      const result = yield* _(Effect.either(mutator(args)))
      if (Either.isLeft(result)) {
        const error = result.left
        if (error._tag === 'NotFound') {
          yield* _(Effect.logError(error.message))
          yield* _(
            server.Error.createError({
              id: generateId({ prefix: 'error', id: ulid() }),
              type: 'NotFound',
              message: error.message,
            }).pipe(Effect.orDie),
          )
        }
      } else {
        result.right
      }
      yield* _(Effect.log(`Processed mutation in ${Date.now() - t1}`))

      return expectedMutationID
    } else {
      // TODO: You can store state here in the database to return to clients to
      // provide additional info about errors.
      yield* _(
        Effect.log(`Handling error from mutation ${JSON.stringify(mutation)} `),
      )
      return lastMutationID
    }
  })
