import { type Transaction } from "@pachi/db";
import type {
  ClientViewDataWithTable,
  SpaceId,
  SubspaceIds,
} from "@pachi/types";

import { SpaceRecordGetter } from "../space-records/space-records";
import type { GetClientViewData } from "../types";

export const getClientViewDataWithTables = async <T extends SpaceId>({
  userId,
  spaceId,
  subspaceId,
  transaction,
}: {
  spaceId: T;
  userId?: string;
  subspaceId: SubspaceIds<T>;
  transaction: Transaction;
}): Promise<ClientViewDataWithTable> => {
  //@ts-ignore
  const getClientViewData = SpaceRecordGetter[spaceId][
    subspaceId
  ] as GetClientViewData;
  if (getClientViewData) {
    return await getClientViewData({
      transaction,
      userId,
      isFullItems: true,
    });
  }
  return [];
};
