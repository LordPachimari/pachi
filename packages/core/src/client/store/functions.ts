import type { WriteTransaction } from "replicache";

import type { Store } from "@pachi/db";

import type { CreateStore, UpdateStore } from "../../schema-and-types/store";

async function createStore(tx: WriteTransaction, input: CreateStore) {
  const { store } = input;
  await tx.set(store.id, store);
}

async function updateStore(tx: WriteTransaction, input: UpdateStore) {
  const { id, updates } = input;
  const store = (await tx.get(id)) as Store | undefined;

  if (!store) {
    console.info(`Store  not found`);
    throw new Error(`Store not found`);
  }
  const updated = { ...store, ...updates };
  await tx.set(id, updated);
}

export { createStore, updateStore };
