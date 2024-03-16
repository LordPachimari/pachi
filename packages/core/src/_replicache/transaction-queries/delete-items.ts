import { inArray } from "drizzle-orm";
import { Effect } from "effect";

import { tableNamesMap, type TableName, type Transaction } from "@pachi/db";
import { UnknownExceptionLogger } from "@pachi/utils";

export const deleteItems_ = ({
  tableName,
  keys,
  transaction,
}: {
  tableName: TableName;
  keys: string[];
  userId: string;
  transaction: Transaction;
}): Effect.Effect<void, never, never> =>
  Effect.gen(function* (_) {
    const table = tableNamesMap[tableName];

    yield _(
      Effect.tryPromise(() =>
        transaction.delete(table).where(inArray(table.id, keys)),
      ).pipe(
        Effect.orDieWith((e) =>
          UnknownExceptionLogger(e, "delete Items error"),
        ),
      ),
    );
  });
