import { eq } from "drizzle-orm";

import { users } from "@pachi/db";

import type { GetClientViewData } from "../../types";

export const userCVD: GetClientViewData = async ({
  transaction,
  userId,
  isFullItems = false,
}) => {
  console.log("-------WATCH-----USERID", userId);
  if (!userId) return [{ cvd: [], tableName: "users" }];
  const UserCVD = isFullItems
    ? await transaction.query.users
        .findFirst({
          where: () => eq(users.id, userId),
          with: {
            stores: true,
          },
        })
        .execute()
    : await transaction.query.users
        .findFirst({
          columns: {
            id: true,
            version: true,
          },
          where: () => eq(users.id, userId),
          with: {
            stores: {
              columns: {
                id: true,
                version: true,
              },
            },
          },
        })
        .execute();
  console.log("-------WATCH", UserCVD?.stores);
  return [
    { cvd: UserCVD ? [UserCVD] : [], tableName: "users" },
    { cvd: UserCVD?.stores ?? [], tableName: "stores" },
  ];
};
