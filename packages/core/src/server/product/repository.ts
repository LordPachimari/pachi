import { eq } from 'drizzle-orm'
import { Effect } from 'effect'

import { type Product } from '@pachi/db'
import { products } from '@pachi/db/schema'

import { ServerContext } from '../context'

export const ProductRepository = {
  getProductById: ({ id }: { id: string }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext)
      return yield* _(
        Effect.tryPromise(() =>
          manager.query.products.findFirst({
            where: (products) => eq(products.id, id),
          }),
        ).pipe(Effect.orDie),
      )
    }),
  insertProduct: ({ product }: { product: Product }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext)
      yield* _(
        Effect.tryPromise(() =>
          //@ts-ignore
          manager.insert(products).values(product),
        ).pipe(Effect.orDie),
      )
    }),
}
export type ProductRepositoryType = typeof ProductRepository
