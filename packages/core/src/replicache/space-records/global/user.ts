import { eq } from "drizzle-orm";
import { Effect, pipe } from "effect";

import { users } from "@pachi/db/schema";
import { withDieErrorLogger } from "@pachi/utils";

import type { GetClientViewDataWithTable } from "../types";

export const userCVD: GetClientViewDataWithTable = ({
  transaction,
  userId,
  isFullItems = false,
}) => {
  if (!userId) return Effect.succeed([{ cvd: [], tableName: "users" }]);
  const cvd = pipe(
    Effect.tryPromise(() =>
      isFullItems
        ? transaction.query.users.findFirst({
            where: () => eq(users.id, userId),
            with: {
              stores: true,
            },
          })
        : transaction.query.users.findFirst({
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
          }),
    ),
    Effect.map((user) => [
      { tableName: "users" as const, cvd: user ? [user] : [] },
      {
        tableName: "stores" as const,
        cvd: user?.stores ?? [],
      },
    ]),
    Effect.orDieWith((e) => withDieErrorLogger(e, "UserCVD space record")),
  );
  return cvd;
};
