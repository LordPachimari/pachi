import type { Cart } from "@pachi/db";
import { MedusaError } from "@pachi/utils";

import { ServiceBase_ } from "./base";

export class CartService_ extends ServiceBase_ {
  async updateCartTotals({ cartId }: { cartId: string }): Promise<void> {
    const cart = (await this.manager.query.carts.findFirst({
      where: (carts, { eq }) => eq(carts.id, cartId),
      with: {
        items: true,
        discount: {
          with: {
            rule: true,
          },
        },
      },
    })) as Cart | undefined;
    if (!cart) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Could not find cart with id "${cartId}"`,
      );
    }
    const cartItems = cart.items ?? [];

    cart.subtotal = 0;
    cart.discountTotal = 0;
    cart.itemTaxTotal = 0;
    cart.shippingTotal = 0;
    cart.shippingTaxTotal = 0;

    cart.items = cartItems.map((item) => {
      cart.subtotal! += item.total;
      cart.discountTotal! += item.discountTotal ?? 0;
      cart.itemTaxTotal! += item.taxTotal ?? 0;
      return item;
    });

    //TODO: shipping tax total, giftcards
    cart.taxTotal = cart.itemTaxTotal + cart.shippingTaxTotal;

    cart.total =
      cart.subtotal + cart.shippingTotal + cart.taxTotal - cart.discountTotal;
    await this.replicacheTransaction.put(cart.id, cart, "carts");
  }
}
