import type { WriteTransaction } from "replicache";
import { string } from "valibot";

import { StoreSchema, StoreUpdatesSchema, type Store } from "@pachi/db";

import type {
  CreateStoreProps,
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

  createStore: async (tx: WriteTransaction, { args }: CreateStoreProps) => {
    const { store } = args;
    StoreSchema._parse(store);
    await tx.put(store.id, store);
  },
  updateStore: async (tx: WriteTransaction, { args }: UpdateStoreProps) => {
    const { id, updates } = args;
    string()._parse(id);
    StoreUpdatesSchema._parse(updates);
    const store = (await tx.get(id)) as Store | undefined;
    if (!store) {
      console.info(`Store  not found`);
      return;
    }
    const updated = { ...store, ...updates };
    await tx.put(id, updated);
  },
};
