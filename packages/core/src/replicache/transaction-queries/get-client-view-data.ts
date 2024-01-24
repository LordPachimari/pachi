import { type Transaction } from "@pachi/db";
import type {
  ClientViewDataWithTable,
  SpaceId,
  SpaceRecords,
} from "@pachi/types";

import { SpaceRecordGetter } from "../space-records/space-records";

export const getClientViewDataWithTables = async <T extends SpaceId>({
  userId,
  spaceId,
  subspaceId,
  transaction,
}: {
  spaceId: T;
  userId?: string | undefined;
  subspaceId: keyof SpaceRecords[T];
  transaction: Transaction;
}): Promise<ClientViewDataWithTable> => {
  const getClientViewData = SpaceRecordGetter[spaceId][subspaceId];
  if (getClientViewData) {
    return await getClientViewData({
      transaction,
      userId,
      isFullItems: true,
    });
  }
  console.log("getClientViewDataWithTables: no getClientViewData found");
  return [];
};
