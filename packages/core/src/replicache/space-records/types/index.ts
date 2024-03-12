import type { Effect } from "effect";

import type { Transaction } from "@pachi/db";
import type { ClientViewDataWithTable } from "@pachi/types";

export type GetClientViewDataWithTable = ({
  transaction,
  isFullItems,
}: {
  transaction: Transaction;
  isFullItems?: boolean;
  userId?: string | undefined;
}) => Effect.Effect<Array<ClientViewDataWithTable>, never, never>;
