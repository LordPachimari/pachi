import type { WriteTransaction } from "replicache";

import { generateId } from "@pachi/utils";
import type { Client, CreateUser } from "@pachi/validators";

async function createUser(tx: WriteTransaction, input: CreateUser) {
  const { user } = input;
  const newStoreId = generateId({ prefix: "store", id: user.id });
  const store: Client.Store = {
    id: newStoreId,
    createdAt: new Date().toISOString(),
    name: "My Store",
    version: 1,
    founderId: user.id,
  };

  await Promise.all([tx.set(user.id, user), tx.set(store.id, store)]);
}

export { createUser };
