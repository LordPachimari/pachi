import type { Effect } from "effect";

import type { Transaction } from "@pachi/db";

import type { RowsWTableName } from "../../types";

export type GetRowsWTableName = ({
  transaction,
  fullRows,
  userId,
}: {
  transaction: Transaction;
  fullRows: boolean;
  userId: string | undefined;
}) => Effect.Effect<RowsWTableName[], never, never>;
