import { Effect } from "effect";
import { Scrypt, type Lucia } from "lucia";

import type { Db } from "@pachi/db";
import { InvalidInput, UserAuthSchema } from "@pachi/validators";

interface LoginProps {
  email: string;
  password: string;
  db: Db;
  lucia: Lucia;
}

const InvalidInputError = new InvalidInput({
  message: "Invalid input",
});

const login = ({ email, password, db, lucia }: LoginProps) => {
  return Effect.gen(function* (_) {
    yield* _(
      Effect.try(() =>
        UserAuthSchema.parse({
          email,
          password,
        }),
      ).pipe(Effect.catchAll(() => Effect.fail(InvalidInputError))),
    );

    const user = yield* _(
      Effect.tryPromise(() =>
        db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, email),
        }),
      ),
    );

    if (!user) {
      return yield* _(Effect.fail(InvalidInputError));
    }

    const validPassword = yield* _(
      Effect.tryPromise(() =>
        new Scrypt().verify(user.hashedPassword, password),
      ),
    );

    if (!validPassword) {
      return yield* _(Effect.fail(InvalidInputError));
    }
    const session = yield* _(
      Effect.tryPromise(() =>
        lucia.createSession(user.id, {
          country: "AU",
        }),
      ),
    );

    return yield* _(
      Effect.succeed({
        type: "SUCCESS",
        message: "Successfully logged in",
        sessionId: session.id,
      }),
    );
  });
};

export { login };
