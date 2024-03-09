import { Effect } from "effect"

import { ErrorSchema } from "../../input-schema/error"
import { zod } from "../../util/zod"
import { ServerContext } from "../context"

const createError = zod(ErrorSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext)
    yield* _(
      Effect.sync(() =>
        replicacheTransaction.set(input.id, { value: input }, "json"),
      ),
    )
  }),
)

export { createError }
