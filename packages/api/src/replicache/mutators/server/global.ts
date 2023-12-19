import { number, object, string } from "valibot";

import {
  CartSchema,
  StoreSchema,
  StoreUpdatesSchema,
  UserSchema,
  type Store,
} from "@pachi/db";
import { generateId } from "@pachi/utils";

import type {
  AddItemToCartProps,
  CreateCartProps,
  CreateStoreProps,
  CreateUserProps,
  DeleteItemProps,
  UpdateItemQuantityProps,
  UpdateStoreProps,
} from "../../../types/mutators/global";
import type { ReplicacheTransaction } from "../../replicache-transaction/transaction";

export type GlobalMutators_ = typeof globalMutators_;
export const globalMutators_ = {
  // createCart: async (
  //   tx: ReplicacheTransaction,
  //   { args, user, requestHeaders, services }: CreateCartProps,
  // ) => {
  //   CreateCartArgsSchema._parse(args);
  //   const { ip, userAgent } = requestHeaders;
  //   const { cart, country_code, items } = args;
  //   //TO_DO retrieve sales_channel
  //   //TO_DO retrieve region
  //   await services.cartService_.create({
  //     ...cart,
  //     context: {
  //       ...cart.context,
  //       ...(ip && { ip }),
  //       ...(userAgent && { userAgent }),
  //     },
  //   });
  //   await services.lineItemService_.generate(items, {
  //     region_id: cart.region_id,
  //     ...(user?.id && { customer_id: user.id }),
  //   });
  //   await services.cartService_.decorateCardTotals(cart.id);
  // },
  // addToCart: async (
  //   tx: ReplicacheTransaction,
  //   { args, user, services }: AddToCartProps,
  // ) => {
  //   const { items, cart_id, region_id } = args;
  //   const lineItems = await services.lineItemService_.generate(items, {
  //     region_id,
  //     ...(user?.id && { customer_id: user.id }),
  //   });
  //   await services.cartService_.addOrUpdateCartItems(cart_id, lineItems);
  // },
  // removeFromCart: async (
  //   tx: ReplicacheTransaction,
  //   { args, user, services }: DeleteItemProps,
  // ) => {
  //   const { item_id } = args;
  //   await services.lineItemService_.deleteItem(item_id);
  // },
  // updateItemQuantity: async (
  //   tx: ReplicacheTransaction,
  //   { args, user, services }: UpdateItemQuantityProps,
  // ) => {
  //   const { item_id, quantity } = args;
  //   await services.lineItemService_.updateItem({
  //     id: item_id,
  //     updates: { quantity },
  //   });
  // },
  createUser: async (
    tx: ReplicacheTransaction,
    { args, repositories }: CreateUserProps,
  ) => {
    const { user } = args;

    const newStoreId = generateId({ prefix: "store", id: user.id });
    UserSchema._parse(user);
    const store: Store = {
      id: newStoreId,
      createdAt: new Date().toISOString(),
      name: user.username,
      version: 1,
      founderId: user.id,
    };

    await repositories?.userRepository.insertUser({user});
    await tx.put(store.id, store, "stores");
  },
  createStore: async (
    tx: ReplicacheTransaction,
    { args }: CreateStoreProps,
  ) => {
    const { store } = args;
    StoreSchema._parse(store);
    await tx.put(store.id, store, "stores");
  },
  updateStore: async (
    tx: ReplicacheTransaction,
    { args }: UpdateStoreProps,
  ) => {
    const { storeId, updates } = args;
    string()._parse(storeId);
    StoreUpdatesSchema._parse(updates);
    await tx.update(storeId, updates, "stores");
  },
  createCart: async (tx: ReplicacheTransaction, { args }: CreateCartProps) => {
    const { cart } = args;
    CartSchema._parse(cart);
    await tx.put(cart.id, cart, "carts");
  },

  addItemToCart: async (
    tx: ReplicacheTransaction,
    { args, services }: AddItemToCartProps,
  ) => {
    const { quantity, variantId, currencyCode, cartItemId, cartId } = args;
    object({
      quantity: number(),
      variantId: string(),
      currencyCode: string(),
      lineItemId: string(),
      cartId: string(),
    })._parse(args);
    const cartItemService = services?.cartItemService;
    const cartService = services?.cartService;
    if (!cartItemService || !cartService) throw new Error("Missing services");
    await cartItemService.generateItem({
      item: {
        cartId,
        currencyCode,
        cartItemId,
        quantity,
        variantId,
      },
    });
    await cartService.updateCartTotals({ cartId });
  },
  updateItemQuantity: async (
    tx: ReplicacheTransaction,
    { args, services }: UpdateItemQuantityProps,
  ) => {
    const { quantity, itemId, cartId } = args;
    object({
      quantity: number(),
      cartItemId: string(),
      cartId: string(),
    })._parse(args);
    const cartItemService = services?.cartItemService;
    const cartService = services?.cartService;
    if (!cartItemService || !cartService) throw new Error("Missing services");
    await cartItemService.updateItem({
      id: itemId,
      updates: { quantity },
      cartId,
    });
    await cartService.updateCartTotals({ cartId });
  },
  deleteItem: async (
    tx: ReplicacheTransaction,
    { args, services }: DeleteItemProps,
  ) => {
    const { id, cartId } = args;
    object({ id: string(), cartId: string() })._parse(id);
    const cartItemService = services?.cartItemService;
    const cartService = services?.cartService;
    if (!cartItemService || !cartService) throw new Error("Missing services");
    await cartItemService.deleteItem(id);
    await cartService.updateCartTotals({ cartId });
  },
};
