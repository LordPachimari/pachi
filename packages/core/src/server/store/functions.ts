import { CreateStoreSchema, UpdateStoreSchema } from "../../schema/store";
import { zod } from "../../util/zod";
import type { ServerProps } from "../initialize";

function createStore(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(CreateStoreSchema, (input) => {
    const { store } = input;
    replicacheTransaction.put(store.id, store, "stores");
  });
}

function updateStore(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(UpdateStoreSchema, (input) => {
    const { id, updates } = input;
    replicacheTransaction.update(id, updates, "stores");
  });
}
export { createStore, updateStore };
