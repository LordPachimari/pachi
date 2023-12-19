import {
  UpdateCartItemSchema,
  type Cart,
  type CartItem,
  type ProductVariant,
  type UpdateCartItem,
} from "@pachi/db";
import { MedusaError } from "@pachi/utils";

import type { ServiceBase } from "./base";

export const CartItemService = {
  async generateItem({
    item,
    manager,
  }: {
    item: {
      variantId: string;
      quantity: number;
      currencyCode: string;
      cartItemId: string;
      cartId: string;
      productId: string;
    };
  } & ServiceBase): Promise<CartItem> {
    const variant = (await manager.get(item.variantId)) as
      | ProductVariant
      | undefined;
    if (!variant) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Could not find any variants with ids"`,
      );
    }
    //TODO: check for the price list

    const prices = variant.prices ?? [];
    const unitPrice = prices.find(
      (p) => p.currencyCode === item.currencyCode,
    );
    if (!unitPrice) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Could not find any prices with currency code ${item.currencyCode}`,
      );
    }

    const cartItem: CartItem = {
      id: item.cartItemId,
      unitPrice: unitPrice.amount,
      title: variant.product!.title,
      description: variant.title,
      thumbnail: variant.product!.thumbnail!,
      variantId: variant.id,
      quantity: item.quantity || 1,
      discountable: variant.product!.discountable,
      isGiftcard: variant.product!.isGiftcard,
      cartId: item.cartId,
      createdAt: new Date().toISOString(),
      total: unitPrice.amount * (item.quantity || 1),
      currencyCode:item.currencyCode
    };
    return cartItem;
  },
  async deleteItem({
    itemId,
    cartId,
    manager,
  }: { itemId: string; cartId: string } & ServiceBase) {
    const cart = (await manager.get(cartId)) as Cart | undefined;
    if (!cart) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Could not find any carts with ids"`,
      );
    }
    await manager.put(cartId, {
      ...cart,
      items: (cart.items??[]).filter((i) => i.id !== itemId),
    });
  },
  async updateItem({ args, manager }: { args: UpdateCartItem } & ServiceBase) {
    UpdateCartItemSchema._parse(args);
    const { id, updates, cartId } = args;
    if (updates.quantity === 0) {
      return await this.deleteItem({ itemId: id, cartId, manager });
    }
    const cart = (await manager.get(cartId)) as Cart | undefined;
    if (!cart) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Could not find any carts with ids"`,
      );
    }

    return manager.put(cartId, {
      ...cart,
      items: (cart.items??[]).map((i) => {
        if (i.id === id) {
          return {
            ...i,
            ...updates,
          };
        }
        return i;
      }),
    });
  },
};
