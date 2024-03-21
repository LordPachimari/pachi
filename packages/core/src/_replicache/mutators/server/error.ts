import { Effect } from "effect";

import { InputErrorSchema } from "@pachi/validators";

import { TableMutator } from "../../../..";
import { zod } from "../../../util/zod";

const createError = zod(InputErrorSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);

    yield* _(Effect.sync(() => tableMutator.set(input, "json")));
  }),
);

export { createError };
