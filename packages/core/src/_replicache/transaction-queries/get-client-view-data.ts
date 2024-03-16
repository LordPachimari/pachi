import { Effect } from "effect";

import { type Transaction } from "@pachi/db";

import {
  InvalidValue,
  type ClientViewRecordWTableName,
  type SpaceID,
  type SpaceRecord,
} from "../../schema-and-types";
import { SpaceRecordGetter } from "../space-record/getter";

export const getClientViewRecordWTables = <T extends SpaceID>({
  userId,
  spaceID,
  subspaceID,
  transaction,
  fullRows,
}: {
  spaceID: T;
  userId: string | undefined;
  subspaceID: SpaceRecord[T][number];
  transaction: Transaction;
  fullRows: boolean;
}): Effect.Effect<ClientViewRecordWTableName, InvalidValue, never> => {
  const getClientViewRecord = SpaceRecordGetter[spaceID][subspaceID];

  if (getClientViewRecord) {
    return getClientViewRecord({
      transaction,
      userId,
      fullRows,
    });
  }

  return Effect.fail(
    new InvalidValue({
      message: "Invalid spaceID or subspaceID",
    }),
  );
};
