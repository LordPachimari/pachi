import { Effect } from "effect";

import { generateId } from "@pachi/utils";
import { CreateUserSchema, type Server } from "@pachi/validators";

import { TableMutator } from "../../../..";
import { zod } from "../../../util/zod";

const createUser = zod(CreateUserSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { user } = input;

    const newStoreId = generateId({ prefix: "store", id: user.id });
    const store: Server.Store = {
      id: newStoreId,
      createdAt: new Date().toISOString(),
      name: user.username ?? "store",
      version: 1,
      founderId: user.id,
    };

    const setUser = tableMutator.set(user, "users");
    const setStore = tableMutator.set(store, "stores");

    return Effect.all([setUser, setStore], { concurrency: 2 });
  }),
);

export { createUser };
