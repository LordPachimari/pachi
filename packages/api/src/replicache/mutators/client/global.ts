import type { WriteTransaction } from "replicache";
import { number, object, string } from "valibot";

import {
  CartSchema,
  StoreSchema,
  StoreUpdatesSchema,
  UserSchema,
  type Store,
} from "@pachi/db";
import { generateId } from "@pachi/utils";

import { CartService } from "../../../services/client/cart";
import { CartItemService } from "../../../services/client/cart-item";
import type {
  AddItemToCartProps,
  CreateCartProps,
  CreateStoreProps,
  CreateUserProps,
  DeleteItemProps,
  UpdateItemQuantityProps,
  UpdateStoreProps,
} from "../../../types/mutators/global";

export type GlobalMutators = typeof globalMutators;

export const globalMutators = {
  // createUser: async (
  //   tx: WriteTransaction,
  //   { name, userId }: { name: string; userId: string },
  // ) => {
  //   console.log("mutators, put user");
  //   const userParams = UserSchema.parse({
  //     id: userId,
  //     createdAt: new Date().toISOString(),
  //     name,
  //     version: 1,
  //   });
  //   await tx.put(userKey({ id: userId }), userParams);
  // },
  // updateUser: async (
  //   tx: WriteTransaction,
  //   props: UpdateUser & { userId: string },
  // ) => {
  //   const updateUser = UpdateUserSchema.parse(props);
  //   const user = (await tx.get(userKey({ id: props.userId }))) as User | null;
  //   if (user) {
  //     await tx.put(userKey({ id: props.userId }), {
  //       ...user,
  //       ...updateUser,
  //     });
  //   }
  // },
  createUser: async (tx: WriteTransaction, { args }: CreateUserProps) => {
    const { user } = args;
    const newStoreId = generateId({ prefix: "store", id: user.id });
    const store: Store = {
      id: newStoreId,
      createdAt: new Date().toISOString(),
      name: "My Store",
      version: 1,
      founderId: user.id,
    };
    UserSchema._parse(user);
    await Promise.all([tx.put(user.id, user), tx.put(store.id, store)]);
  },

  createStore: async (tx: WriteTransaction, { args }: CreateStoreProps) => {
    const { store } = args;
    StoreSchema._parse(store);
    await tx.put(store.id, store);
  },
  updateStore: async (tx: WriteTransaction, { args }: UpdateStoreProps) => {
    const { storeId, updates } = args;
    string()._parse(storeId);
    StoreUpdatesSchema._parse(updates);
    const store = (await tx.get(storeId)) as Store | undefined;
    if (!store) {
      console.info(`Store  not found`);
      return;
    }
    const updated = { ...store, ...updates };
    await tx.put(storeId, updated);
  },

  createCart: async (tx: WriteTransaction, { args }: CreateCartProps) => {
    const { cart } = args;
    CartSchema._parse(cart);
    await tx.put(cart.id, cart);
  },

  addItemToCart: async (tx: WriteTransaction, { args }: AddItemToCartProps) => {
    const { quantity, variantId, currencyCode, cartItemId, productId, cartId } =
      args;
    object({
      quantity: number(),
      variantId: string(),
      currencyCode: string(),
      cartItemId: string(),
      cartId: string(),
      productId: string(),
    })._parse(args);
    await CartItemService.generateItem({
      item: {
        cartId,
        currencyCode,
        cartItemId,
        quantity,
        variantId,
        productId,
      },

      manager: tx,
    });
    await CartService.updateCartTotals({ cartId, manager: tx });
  },
  updateItemQuantity: async (
    tx: WriteTransaction,
    { args }: UpdateItemQuantityProps,
  ) => {
    const { quantity, itemId, cartId } = args;
    object({
      quantity: number(),
      itemId: string(),
      cartId: string(),
    })._parse(args);
    await CartItemService.updateItem({
      args: {
        id: itemId,
        updates: { quantity },
        cartId,
      },
      manager: tx,
    });
    await CartService.updateCartTotals({ cartId, manager: tx });
  },
  deleteItem: async (tx: WriteTransaction, { args }: DeleteItemProps) => {
    const { id, cartId } = args;
    string()._parse(id);
    string()._parse(cartId);
    await CartItemService.deleteItem({ cartId, itemId: id, manager: tx });
    await CartService.updateCartTotals({ cartId, manager: tx });
  },
};
