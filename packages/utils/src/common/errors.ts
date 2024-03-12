import { Effect } from "effect";
import type { UnknownException } from "effect/Cause";

import type { InvalidValue } from "@pachi/types";

export const withDieErrorLogger = (
  e: UnknownException | InvalidValue,
  title: string,
) => {
  Effect.logError(`${title} error: ${e.message}`);
  
  return new Error(`${title} error: ${e.message}`);
};
