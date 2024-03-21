import { Effect } from "effect";

import type { Server } from "@pachi/validators";

import { Database } from "../context/database";
import type { ResultType } from "./type";

  function getOptionByID<T extends { values?: true } | undefined>({
    id,
    _with,
  }: {
    id: string;
    _with?: T;
  })  {
    return Effect.gen(function* (_) {
      const { transaction } = yield* _(Database);

      const result = yield* _(
        Effect.tryPromise(() => {
          return transaction.query.productOptions.findFirst({
            where: (option, { eq }) => eq(option.id, id),
            ...(_with && { with: _with }),
          });
        }),
      );

      return result as ResultType<T, Server.ProductOption>;
    });
  }

export { getOptionByID};
