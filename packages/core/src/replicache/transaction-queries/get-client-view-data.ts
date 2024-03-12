import { Effect } from "effect";

import { type Transaction } from "@pachi/db";
import { InvalidValue } from "@pachi/types";
import type {
  ClientViewDataWithTable,
  SpaceId,
  SpaceRecords,
} from "@pachi/types";

import { SpaceRecordGetter } from "../space-records/space-records";

export const getClientViewDataWithTables = <T extends SpaceId>({
  userId,
  spaceId,
  subspaceId,
  transaction,
  isFullItems,
}: {
  spaceId: T;
  userId?: string;
  subspaceId: keyof SpaceRecords[T];
  transaction: Transaction;
  isFullItems: boolean;
}): Effect.Effect<Array<ClientViewDataWithTable>, InvalidValue, never> => {
  const getClientViewData = SpaceRecordGetter[spaceId][subspaceId];

  if (getClientViewData) {
    return getClientViewData({
      transaction,
      userId,
      isFullItems,
    });
  }

  return Effect.fail(
    new InvalidValue({
      message: `Invalid spaceId or subspaceId: ${spaceId} ${String(
        subspaceId,
      )}`,
    }),
  );
};
