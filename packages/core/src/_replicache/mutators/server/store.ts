import { Effect } from "effect";

import { CreateStoreSchema, UpdateStoreSchema } from "@pachi/validators";

import { TableMutator } from "../../../..";
import { zod } from "../../../util/zod";

const createStore = zod(CreateStoreSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { store } = input;

    return tableMutator.set(store, "stores");
  }),
);

const updateStore = zod(UpdateStoreSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { id, updates } = input;

    return tableMutator.update(id, updates, "stores");
  }),
);

export { createStore, updateStore };
