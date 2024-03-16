import { eq } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { mapToObj } from "remeda";

import { users } from "@pachi/db/schema";
import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetClientViewRecordWTableName } from "../types";

export const userCVD: GetClientViewRecordWTableName = ({
  transaction,
  userId,
  fullRows = false,
}) => {
  if (!userId) return Effect.succeed({ users: {} });
  const cvd = pipe(
    Effect.tryPromise(() =>
      fullRows
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
    Effect.map((user) => {
      return {
        users: user ? { [user.id]: user.version } : {},
        stores: user?.stores
          ? mapToObj(user.stores, (store) => [store.id, store.version])
          : {},
      };
    }),
    Effect.orDieWith((e) =>
      UnknownExceptionLogger(e, "ERROR RETRIEVING USER CVD"),
    ),
  );

  return cvd;
};
