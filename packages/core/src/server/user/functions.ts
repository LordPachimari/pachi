import type { Store } from "@pachi/db";
import { generateId } from "@pachi/utils";

import { CreateUserSchema } from "../../input-schema/user";
import { zod } from "../../util/zod";
import type { ServerProps } from "../initialize";

function createUser(props: ServerProps) {
  const { replicacheTransaction, repositories } = props;
  return zod(CreateUserSchema, async (input) => {
    const { user } = input;

    const newStoreId = generateId({ prefix: "store", id: user.id });
    const store: Store = {
      id: newStoreId,
      createdAt: new Date().toISOString(),
      name: user.username,
      version: 1,
      founderId: user.id,
    };

    await repositories.userRepository.insertUser({ user });
    replicacheTransaction.set(store.id, store, "stores");
  });
}
export { createUser };
