import { string } from "valibot";

import { StoreSchema, StoreUpdatesSchema } from "@pachi/db";

import type {
  CreateStoreProps,
  UpdateStoreProps,
} from "../../../types/mutators";
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
  //   await services.cartService_.addOrUpdateLineItems(cart_id, lineItems);
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
    const { id, updates } = args;
    string()._parse(id);
    StoreUpdatesSchema._parse(updates);
    await tx.update(id, updates, "stores");
  },
};
