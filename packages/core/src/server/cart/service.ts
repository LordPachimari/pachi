import { eq } from "drizzle-orm"
import { Effect } from "effect"
import type { ReadonlyJSONObject } from "replicache"

import type { CartItem } from "@pachi/db"
import { cartItems } from "@pachi/db/schema"
import { NotFound } from "@pachi/types"
import { withDieErrorLogger } from "@pachi/utils"

import { ServerContext } from "../context"

export const CartService = {
  updateCartTotals: ({ cartId }: { cartId: string }) =>
    Effect.gen(function* (_) {
      const { manager, replicacheTransaction } = yield* _(ServerContext)
      const cart = yield* _(
        Effect.tryPromise(() =>
          manager.query.carts.findFirst({
            where: (carts, { eq }) => eq(carts.id, cartId),
            with: {
              items: true,
              discount: {
                with: {
                  rule: true,
                },
              },
            },
          }),
        ).pipe(
          Effect.orDieWith((e) => withDieErrorLogger(e, "Could not find cart")),
        ),
      )
      if (!cart) {
        Effect.fail(new NotFound({ message: "Could not find cart" }))
        return
      }
      const cartItems = cart.items ?? []

      cart.subtotal = 0
      cart.discountTotal = 0
      cart.itemTaxTotal = 0
      cart.shippingTotal = 0
      cart.shippingTaxTotal = 0

      cart.items = cartItems.map((item) => {
        cart.subtotal! += item.total
        cart.discountTotal! += item.discountTotal ?? 0
        cart.itemTaxTotal! += item.taxTotal ?? 0
        return item
      })

      //TODO: shipping tax total, giftcards
      cart.taxTotal = cart.itemTaxTotal + cart.shippingTaxTotal

      cart.total =
        cart.subtotal + cart.shippingTotal + cart.taxTotal - cart.discountTotal
      replicacheTransaction.set(cart.id, cart as ReadonlyJSONObject, "carts")
    }),
  generateCartItem: ({
    item,
  }: {
    item: {
      variantId: string
      quantity: number
      currencyCode: string
      cartItemId: string
      cartId: string
    }
  }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext)
      const variant = yield* _(
        Effect.tryPromise(() =>
          manager.query.productVariants.findFirst({
            where: (variant, { eq }) => eq(variant.id, item.variantId),
            with: {
              prices: true,
              product: {
                columns: {
                  title: true,
                  thumbnail: true,
                  discountable: true,
                },
              },
            },
          }),
        ).pipe(Effect.orDie),
      )
      if (!variant) {
        yield* _(
          Effect.fail(new NotFound({ message: "Could not find variant" })),
        )
        return
      }

      //TODO: check for the price list

      const prices = variant.prices
      const unitPrice = prices.find((p) => p.currencyCode === item.currencyCode)
      if (!unitPrice) {
        yield* _(
          Effect.fail(
            new NotFound({
              message: `Could not find prices with currency code ${item.currencyCode}`,
            }),
          ),
        )
        return
      }

      const cartItem: CartItem = {
        id: item.cartItemId,
        unitPrice: unitPrice.amount,
        title: variant.product.title,
        description: variant.title,
        thumbnail: variant.product.thumbnail!,
        variantId: variant.id,
        quantity: item.quantity || 1,
        discountable: variant.product.discountable,
        cartId: item.cartId,
        createdAt: new Date().toISOString(),
        total: unitPrice.amount * (item.quantity || 1),
        currencyCode: item.currencyCode,
      }
      yield* _(
        Effect.tryPromise(() =>
          //@ts-ignore
          manager.insert(cartItems).values(cartItem),
        ).pipe(Effect.orDie),
      )
      return cartItem
    }),
  deleteCartItem: (itemId: string) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext)
      yield* _(
        Effect.tryPromise(() =>
          manager.delete(cartItems).where(eq(cartItems.id, itemId)),
        ).pipe(Effect.orDie),
      )
    }),
}
export type CartServiceType = typeof CartService
