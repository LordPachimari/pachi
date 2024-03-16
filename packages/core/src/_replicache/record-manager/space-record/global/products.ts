import { eq } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { mapToObj } from "remeda";

import { products } from "@pachi/db/schema";
import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetRowsWTableName } from "../types";

export const productsCVD: GetRowsWTableName = ({
  transaction,
  fullRows = false,
}) => {
  const cvd = pipe(
    Effect.tryPromise(() =>
      fullRows
        ? transaction
            .select()
            .from(products)
            .where(eq(products.status, "published"))
        : transaction
            .select({ id: products.id, version: products.version })
            .from(products)
            .where(eq(products.status, "published")),
    ),
    Effect.map((products) => [
      { tableName: "products" as const, rows: products },
    ]),
    Effect.orDieWith((e) =>
      UnknownExceptionLogger(e, "ERROR RETRIEVING PRODUCTS ROWS"),
    ),
  );

  return cvd;
};
