import type { Effect } from "effect";

import type { Transaction } from "@pachi/db";
import type { RowsWTableName } from "@pachi/validators";

export type GetRowsWTableName = ({
  transaction,
  fullRows,
  userID,
}: {
  transaction: Transaction;
  fullRows: boolean;
  userID: string | undefined;
}) => Effect.Effect<RowsWTableName[], never, never>;
