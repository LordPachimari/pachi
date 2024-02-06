import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { ServerContext } from "../../context/server";

export const StoreRepository = {
  getStoreById: ({ id }: { id: string }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);
      return yield* _(
        Effect.tryPromise(() =>
          manager.query.stores.findFirst({
            where: (stores) => eq(stores.id, id),
          }),
        ).pipe(Effect.orDie),
      );
    }),
};
export type StoreRepositoryType = typeof StoreRepository;
