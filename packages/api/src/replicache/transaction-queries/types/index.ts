import type { Transaction } from "@pachi/db";
import type { ClientViewDataWithTable } from "@pachi/types";

export type GetClientViewData = ({
  transaction,
  isFullItems,
}: {
  transaction: Transaction;
  isFullItems?: boolean;
  userId?: string | undefined;
}) => Promise<ClientViewDataWithTable>;
