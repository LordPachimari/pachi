import { eq } from "drizzle-orm";

import {
  UpdateCartItemSchema,
  type CartItem,
  type UpdateCartItem,
} from "@pachi/db";
import { cartItems } from "@pachi/db/schema";
import { MedusaError } from "@pachi/utils";

import { ServiceBase_ } from "./base";

export class CartItemService_ extends ServiceBase_ {
  async generateItem({
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
            isGiftcard: true,
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
      isGiftcard: variant.product.isGiftcard,
      cartId: item.cartId,
      createdAt: new Date().toISOString(),
      total: unitPrice.amount * (item.quantity || 1),
      currencyCode: item.currencyCode,
    };
    //@ts-ignore
    await this.manager.insert(cartItems).values(cartItem);
    return cartItem;
  }
  async deleteItem(itemId: string) {
    return await this.manager.delete(cartItems).where(eq(cartItems.id, itemId));
  }
  async updateItem(args: UpdateCartItem) {
    UpdateCartItemSchema._parse(args);
    const { id, updates } = args;
    if (updates.quantity <= 0) {
      return await this.manager.delete(cartItems).where(eq(cartItems.id, id));
    }
    return await this.manager
      .update(cartItems)
      .set(updates)
      .where(eq(cartItems.id, id));
  }
}
