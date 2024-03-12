import { Effect } from "effect";
import type { ReadonlyJSONObject } from "replicache";

import { tableNamesMap, type TableName, type Transaction } from "@pachi/db";

export const setItems_ = ({
  tableName,
  items,
  transaction,
}: {
  tableName: TableName;

  items: { id: string | Record<string, string>; value: ReadonlyJSONObject }[];
  transaction: Transaction;
}): Effect.Effect<void, never, never> => {
  const table = tableNamesMap[tableName];
  const itemsToPut = items.map(({ value }) => value);

  console.log("items to put", JSON.stringify(itemsToPut));

  return Effect.tryPromise(() =>
    transaction
      .insert(table)
      //@ts-ignore
      .values(itemsToPut)
      .onConflictDoNothing(),
  ).pipe(
    Effect.orDieWith((e) => Effect.logError(`setItems error: ${e.message}`)),
  );
};
