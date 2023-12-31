import { eq } from "drizzle-orm";

import { users } from "@pachi/db";

import type { GetClientViewData } from "../../types";

export const userCVD: GetClientViewData = async ({
  transaction,
  userId,
  isFullItems = false,
}) => {
  if (!userId) return [{ cvd: [], tableName: "users" }];
  const UserCVD = isFullItems
    ? await transaction.query.users
        .findFirst({
          where: () => eq(users.id, userId),
        })
        .execute()
    : await transaction.query.users
        .findFirst({
          columns: {
            id: true,
            version: true,
          },
          where: () => eq(users.id, userId),
        })
        .execute();
  return [{ cvd: UserCVD ? [UserCVD] : [], tableName: "users" }];
};
