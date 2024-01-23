import { eq } from "drizzle-orm";

import type { Cart, CartItem } from "@pachi/db";
import { cartItems } from "@pachi/db/schema";
import { MedusaError } from "@pachi/utils";

import { ServiceBase } from "../base/service";

export class CartService extends ServiceBase {
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
    this.replicacheTransaction.set(cart.id, cart, "carts");
  }
  async generateCartItem({
    item,
  }: {
    item: {
      variantId: string;
      quantity: number;
      currencyCode: string;
      cartItemId: string;
      cartId: string;
    };
  }): Promise<CartItem> {
    const variant = await this.manager.query.productVariants.findFirst({
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
    });
    if (!variant) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Could not find any variants with ids"`,
      );
    }

    //TODO: check for the price list

    const prices = variant.prices;
    const unitPrice = prices.find((p) => p.currencyCode === item.currencyCode);
    if (!unitPrice) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Could not find any prices with currency code ${item.currencyCode}`,
      );
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
    };
    //@ts-ignore
    await this.manager.insert(cartItems).values(cartItem);
    return cartItem;
  }
  async deleteCartItem(itemId: string) {
    return await this.manager.delete(cartItems).where(eq(cartItems.id, itemId));
  }
}
