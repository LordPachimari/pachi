import type { WriteTransaction } from "replicache";


import type { Client, CreateStore, UpdateStore } from "@pachi/validators";

async function createStore(tx: WriteTransaction, input: CreateStore) {
  const { store } = input;
  await tx.set(store.id, store);
}

async function updateStore(tx: WriteTransaction, input: UpdateStore) {
  const { id, updates } = input;
  const store = (await tx.get(id)) as Client.Store | undefined;

  if (!store) {
    console.info(`Store  not found`);
    throw new Error(`Store not found`);
  }
  const updated = { ...store, ...updates };
  
  return tx.set(id, updated);
}

export { createStore, updateStore };
