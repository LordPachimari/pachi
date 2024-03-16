/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Effect } from "effect";
import type { z, ZodError } from "zod";

import type { NotFound } from "../schema-and-types";
import type { ServerContext } from "../server";

export function zod<Schema extends z.ZodSchema<any, any, any>>(
  schema: Schema,
  func: (
    value: z.infer<Schema>,
  ) => Effect.Effect<void, NotFound | ZodError, ServerContext>,
) {
  const result = (input: z.infer<Schema>) => {
    const parsed = schema.parse(input);

    return func(parsed);
  };

  return result;
}
