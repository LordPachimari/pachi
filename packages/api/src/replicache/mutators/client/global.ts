import type { WriteTransaction } from "replicache";
import { string } from "valibot";

import {
  StoreSchema,
  StoreUpdatesSchema,
  UserSchema,
  type Store,
} from "@pachi/db";
import { generateId } from "@pachi/utils";

import type {
  CreateStoreProps,
  CreateUserProps,
  UpdateStoreProps,
} from "../../../types/mutators";

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
    const new_store_id = generateId({ prefix: "store", id: user.id });
    const store: Store = {
      id: new_store_id,
      created_at: new Date().toISOString(),
      name: "My Store",
      version: 1,
      founder_id: user.id,
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
    const { store_id, updates } = args;
    string()._parse(store_id);
    StoreUpdatesSchema._parse(updates);
    const store = (await tx.get(store_id)) as Store | undefined;
    if (!store) {
      console.info(`Store  not found`);
      return;
    }
    const updated = { ...store, ...updates };
    await tx.put(store_id, updated);
  },
};
