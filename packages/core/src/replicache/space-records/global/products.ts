import { eq } from "drizzle-orm";
import { Effect, pipe } from "effect";

import { products } from "@pachi/db/schema";
import { withDieErrorLogger } from "@pachi/utils";

import type { GetClientViewDataWithTable } from "../types";

export const productsCVD: GetClientViewDataWithTable = ({
  transaction,
  isFullItems = false,
}) => {
  const cvd = pipe(
    Effect.tryPromise(() =>
      isFullItems
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
      { tableName: "products" as const, cvd: products },
    ]),
    Effect.orDieWith((e) => withDieErrorLogger(e, "productsCVD space record")),
  );
  return cvd;
};
