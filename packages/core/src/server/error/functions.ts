import { Effect } from "effect";

import { InputErrorSchema } from "../../schema-and-types";
import { zod } from "../../util/zod";
import { ServerContext } from "../context";

const createError = zod(InputErrorSchema, (input) =>
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
