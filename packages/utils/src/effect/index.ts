import type { Effect } from "effect";

type ExtractEffectValue<E> = E extends Effect.Effect<infer Value, never, never>
  ? Value
  : never;

export type { ExtractEffectValue };
