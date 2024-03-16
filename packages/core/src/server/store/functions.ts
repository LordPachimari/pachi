import { Effect } from "effect";

import {
  CreateStoreSchema,
  UpdateStoreSchema,
} from "../../schema-and-types/store";
import { zod } from "../../util/zod";
import { ServerContext } from "../context";

const createStore = zod(CreateStoreSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { store } = input;

    yield* _(
      Effect.sync(() => replicacheTransaction.set(store.id, store, "stores")),
    );
  }),
);

const updateStore = zod(UpdateStoreSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { id, updates } = input;

    yield* _(
      Effect.sync(() => replicacheTransaction.update(id, updates, "stores")),
    );
  }),
);

export { createStore, updateStore };
