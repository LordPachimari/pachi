import { Effect } from "effect";

import type { Cart } from "@pachi/db";
import { NotFound } from "@pachi/types";

import { ClientContext } from "../../context/client";

export const CartService = {
  createCart: ({ cart }: { cart: Cart }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ClientContext);

      return yield* _(
        Effect.tryPromise(() => manager.set(cart.id, cart)).pipe(Effect.orDie),
      );
    }),

  updateCartTotals: ({ cartId }: { cartId: string }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ClientContext);

      const serverCart = yield* _(
        Effect.tryPromise(() => manager.get<Cart>(cartId)).pipe(Effect.orDie),
      );
      const cart = structuredClone(serverCart) as Cart | undefined;
      if (!cart) {
        return yield* _(
          Effect.fail(
            new NotFound({
              message: `Cart with id ${cartId} not found`,
            }),
          ),
        );
      }
      const cartItems = cart.items ?? [];

      cart.subtotal = 0;
      cart.discountTotal = 0;
      cart.itemTaxTotal = 0;
      cart.shippingTotal = 0;
      cart.shippingTaxTotal = 0;
      cart.totalQuantity = 0;

      cart.items = cartItems.map((item) => {
        cart.subtotal! += item.total;
        cart.discountTotal! += item.discountTotal ?? 0;
        cart.itemTaxTotal! += item.taxTotal ?? 0;
        cart.totalQuantity! += item.quantity;
        return item;
      });

      //TODO: shipping tax total, giftcards
      cart.taxTotal = cart.itemTaxTotal + cart.shippingTaxTotal;

      cart.total =
        cart.subtotal + cart.shippingTotal + cart.taxTotal - cart.discountTotal;
      yield* _(
        Effect.tryPromise(() => manager.set(cart.id, cart)).pipe(Effect.orDie),
      );
    }),
};
