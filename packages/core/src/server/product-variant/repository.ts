import { eq } from "drizzle-orm"
import { Effect } from "effect"

import type { ProductVariant } from "@pachi/db"
import { productVariants } from "@pachi/db/schema"

import { ServerContext } from "../context"

export const ProductVariantRepository = {
  getProductVariantById: (id: string) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext)
      return yield* _(
        Effect.tryPromise(() =>
          manager.query.productVariants.findFirst({
            where: (variant) => eq(variant.id, id),
            with: {
              product: true,
            },
          }),
        ).pipe(Effect.orDie),
      )
    }),
  insertProductVariant: ({ variant }: { variant: ProductVariant }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext)
      yield* _(
        Effect.tryPromise(() =>
          //@ts-ignore
          manager.insert(productVariants).values(variant),
        ).pipe(Effect.orDie),
      )
    }),
}
export type ProductVariantRepositoryType = typeof ProductVariantRepository
