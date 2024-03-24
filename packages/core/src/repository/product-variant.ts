import { Effect } from "effect";

import type { Server } from "@pachi/validators";

import { Database } from "../context/database";
import type { ResultType } from "./type";

function getVariantByID<T extends { product?: true } | undefined>({
  id,
  _with,
}: {
  id: string;
  _with?: T;
}) {
  return Effect.gen(function* (_) {
    const { transaction } = yield* _(Database);

    const result = yield* _(
      Effect.tryPromise(() => {
        return transaction.query.productVariants.findFirst({
          where: (variant, { eq }) => eq(variant.id, id),
          ...(_with && { with: _with }),
        });
      }),
    );

    return result as ResultType<T, Server.ProductVariant>;
  });
}

export { getVariantByID };
