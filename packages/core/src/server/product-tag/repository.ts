import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { type ProductTag } from "@pachi/db";
import { productsToTags, productTags } from "@pachi/db/schema";

import { ServerContext } from "../context";

export const ProductTagRepository = {
  getProductTag: ({ id }: { id: string }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);

      return yield* _(
        Effect.tryPromise(() =>
          manager.query.productTags.findFirst({
            where: (tag) => eq(tag.id, id),
            with: {
              products: true,
            },
          }),
        ).pipe(Effect.orDie),
      );
    }),

  createProductTag: ({ tag }: { tag: ProductTag }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);

      return yield* _(
        Effect.tryPromise(() =>
          //@ts-ignore
          manager.insert(productTags).values(tag).returning(),
        ).pipe(Effect.orDie),
      );
    }),
  createProductTags: ({ tags }: { tags: ProductTag[] }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);

      return yield* _(
        Effect.tryPromise(() =>
          //@ts-ignore
          manager.insert(productTags).values(tags).returning(),
        ).pipe(Effect.orDie),
      );
    }),
  assignTagToProduct: ({
    tagId,
    productId,
  }: {
    tagId: string;
    productId: string;
  }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);

      yield* _(
        Effect.tryPromise(() =>
          manager.insert(productsToTags).values({
            productId,
            tagId,
          }),
        ).pipe(Effect.orDie),
      );
    }),
  deleteTagsFromProduct: ({ productId }: { productId: string }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);

      yield* _(
        Effect.tryPromise(() =>
          manager
            .delete(productsToTags)
            .where(eq(productsToTags.productId, productId)),
        ).pipe(Effect.orDie),
      );
    }),
};
export type ProductTagRepositoryType = typeof ProductTagRepository;
