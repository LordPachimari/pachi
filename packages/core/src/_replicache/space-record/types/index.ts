import type { Effect } from "effect";

import type { Transaction } from "@pachi/db";

import type { ClientViewRecordWTableName } from "../../../schema-and-types";

export type GetClientViewRecordWTableName = ({
  transaction,
  fullRows,
  userId
}: {
  transaction: Transaction;
  fullRows: boolean;
  userId: string | undefined;
}) => Effect.Effect<ClientViewRecordWTableName, never, never>;
