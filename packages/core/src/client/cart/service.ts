import type { Cart } from "@pachi/db";
import { MedusaError } from "@pachi/utils";

import { ServiceBase } from "../base/service";

export class CartService extends ServiceBase {
  async createCart({ cart }: { cart: Cart } & ServiceBase): Promise<void> {
    await this.manager.put(cart.id, cart);
  }

  async updateCartTotals({
    cartId,
  }: { cartId: string } & ServiceBase): Promise<void> {
    const cart = (await this.manager.get(cartId)) as Cart | undefined;
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
    await this.manager.put(cart.id, cart);
  }
}
