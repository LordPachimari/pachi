import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { ServerContext } from "../context";

export const ProductOptionRepository = {
  getProductOption: (id: string) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);
      return yield* _(
        Effect.tryPromise(() =>
          manager.query.productOptions.findFirst({
            where: (option) => eq(option.id, id),
            with: {
              values: true,
            },
          }),
        ).pipe(Effect.orDie),
      );
    }),
};
export type ProductOptionRepositoryType = typeof ProductOptionRepository;
