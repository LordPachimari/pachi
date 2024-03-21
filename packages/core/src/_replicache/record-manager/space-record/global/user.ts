import { eq } from "drizzle-orm";
import { Effect, pipe } from "effect";

import { users } from "@pachi/db/schema";
import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetRowsWTableName } from "../types";

export const userCVD: GetRowsWTableName = ({
  transaction,
  userID,
  fullRows = false,
}) => {
  if (!userID) return Effect.succeed([]);
  const cvd = pipe(
    Effect.tryPromise(() =>
      fullRows
        ? transaction.query.users.findFirst({
            where: () => eq(users.id, userID),
            with: {
              stores: true,
            },
          })
        : transaction.query.users.findFirst({
            columns: {
              id: true,
              version: true,
            },
            where: () => eq(users.id, userID),
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
      { tableName: "users" as const, rows: user ? [user] : [] },
      {
        tableName: "stores" as const,
        rows: user?.stores ?? [],
      },
    ]),
    Effect.orDieWith((e) =>
      UnknownExceptionLogger(e, "ERROR RETRIEVING USER CVD"),
    ),
  );

  return cvd;
};
