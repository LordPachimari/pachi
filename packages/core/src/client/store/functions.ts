import type { WriteTransaction } from "replicache";

import type { Store } from "@pachi/db";

import type { CreateStore, UpdateStore } from "../../schema/store";

async function createStore(tx: WriteTransaction, input: CreateStore) {
  const { store } = input;
  await tx.put(store.id, store);
}
async function updateStore(tx: WriteTransaction, input: UpdateStore) {
  const { id, updates } = input;
  const store = (await tx.get(id)) as Store | undefined;
  if (!store) {
    console.info(`Store  not found`);
    return;
  }
  const updated = { ...store, ...updates };
  await tx.put(id, updated);
}
export { createStore, updateStore };
