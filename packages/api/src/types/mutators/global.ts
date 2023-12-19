import { array, number, object, string, type Output } from "valibot";

import type { Cart, Store, StoreUpdates, User } from "@pachi/db";

import type { MutationBase } from "./base";

const ItemsSchema = array(
  object({
    id: string(),
    variantId: string(),
    quantity: number(),
  }),
);
type Items = Output<typeof ItemsSchema>;
export interface CreateUserProps extends MutationBase {
  args: {
    user: User;
  };
}

export interface CreateStoreProps extends MutationBase {
  args: {
    store: Store;
  };
}
export interface CreateCartProps extends MutationBase {
  args: {
    cart: Cart;
  };
}
export interface UpdateStoreProps extends MutationBase {
  args: { updates: StoreUpdates; storeId: string };
}

export interface AddItemToCartProps extends MutationBase {
  args: {
    variantId: string;
    quantity: number;
    currencyCode: string;
    cartItemId: string;
    productId: string;
    cartId: string;
  };
}
export interface UpdateItemQuantityProps extends MutationBase {
  args: {
    itemId: string;
    quantity: number;
    cartId: string;
  };
}
export interface DeleteItemProps extends MutationBase {
  args: {
    id: string;
    cartId: string;
  };
}
