import type { WriteTransaction } from "replicache";

import type { Store } from "@pachi/db";
import { generateId } from "@pachi/utils";

import type { CreateUser } from "../../input-schema/user";

async function createUser(tx: WriteTransaction, input: CreateUser) {
  const { user } = input;
  const newStoreId = generateId({ prefix: "store", id: user.id });
  const store: Store = {
    id: newStoreId,
    createdAt: new Date().toISOString(),
    name: "My Store",
    version: 1,
    founderId: user.id,
  };
  await Promise.all([tx.set(user.id, user), tx.set(store.id, store)]);
}

export { createUser };
