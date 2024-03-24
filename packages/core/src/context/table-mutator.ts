import { Context, type Effect } from "effect";
import type { ReadonlyJSONObject } from "replicache";

import type { TableName } from "@pachi/db";
import type { AuthorizationError, NotFound } from "@pachi/validators";

class TableMutator extends Context.Tag("TableMutator")<
  TableMutator,
  {
    set(
      value: ReadonlyJSONObject | Array<ReadonlyJSONObject>,
      tableName: TableName,
    ): Effect.Effect<void, NotFound | AuthorizationError, never>;
    update(
      key: string,
      value: ReadonlyJSONObject,
      tableName: TableName,
    ): Effect.Effect<void, NotFound | AuthorizationError, never>;
    delete(
      key: string | string[],
      tableName: TableName,
    ): Effect.Effect<void, NotFound | AuthorizationError, never>;
  }
>() {}

export { TableMutator };
