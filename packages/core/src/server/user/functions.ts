import { Effect } from "effect";

import type { Store } from "@pachi/db";
import { generateId } from "@pachi/utils";

import { CreateUserSchema } from "../../input-schema/user";
import { zod } from "../../util/zod";
import { ServerContext } from "../context";

const createUser = zod(CreateUserSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction, repositories } = yield* _(ServerContext);
    const { user } = input;

    const newStoreId = generateId({ prefix: "store", id: user.id });
    const store: Store = {
      id: newStoreId,
      createdAt: new Date().toISOString(),
      name: user.username ?? "store",
      version: 1,
      founderId: user.id,
    };

    yield* _(repositories.userRepository.insertUser({ user }));
    replicacheTransaction.set(store.id, store, "stores");
  }),
);

export { createUser };
