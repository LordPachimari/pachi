import { Effect } from "effect";

import { type User } from "@pachi/db";
import { users } from "@pachi/db/schema";

import { ServerContext } from "../../context/server";

export const UserRepository = {
  insertUser: ({ user }: { user: User }) =>
    Effect.gen(function* (_) {
      const { manager } = yield* _(ServerContext);
      yield* _(
        Effect.tryPromise(() =>
          //@ts-ignore
          manager.insert(users).values(user),
        ).pipe(Effect.orDie),
      );
    }),
};
export type UserRepositoryType = typeof UserRepository;
