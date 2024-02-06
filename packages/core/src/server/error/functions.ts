import { Effect } from "effect";

import { ServerContext } from "../../context/server";
import { ErrorSchema } from "../../input-schema/error";
import { zod } from "../../util/zod";

const createError = zod(ErrorSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    yield* _(
      Effect.sync(() =>
        replicacheTransaction.set(input.id, { value: input }, "json"),
      ),
    );
  }),
);

export { createError };
