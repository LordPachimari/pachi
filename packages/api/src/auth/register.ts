import { Effect } from "effect";
import { generateId, Scrypt, type Lucia } from "lucia";

import type { Db } from "@pachi/db";
import { users } from "@pachi/db/schema";
import { InvalidInput, UserAuthSchema, type Server } from "@pachi/validators";

interface RegisterProps {
  email: string;
  password: string;
  db: Db;
  lucia: Lucia;
}

const InvalidInputError = new InvalidInput({
  message: "Invalid input",
});

const register = ({ email, password, db, lucia }: RegisterProps) => {
  return Effect.gen(function* (_) {
    yield* _(
      Effect.try(() =>
        UserAuthSchema.parse({
          email,
          password,
        }),
      ).pipe(Effect.catchAll(() => Effect.fail(InvalidInputError))),
    );

    const createdAt = new Date().toISOString();
    const hashedPassword = yield* _(
      Effect.tryPromise(() => new Scrypt().hash(password)),
    );
    const newUser: Server.User = {
      id: generateId(15),
      email,
      createdAt,
      hashedPassword,
    };

    yield* _(
      //@ts-ignore
      Effect.tryPromise(() => db.insert(users).values(newUser)).pipe(
        Effect.catchAll((error) => {
          Effect.logError(error);

          return Effect.succeed({
            type: "ERROR",
            message: "User already exist",
          });
        }),
      ),
    );
    const session = yield* _(
      Effect.tryPromise(() =>
        lucia.createSession(newUser.id, {
          country: "AU",
        }),
      ),
    );

    return yield* _(
      Effect.succeed({
        type: "SUCCESS",
        message: "Successfully registered",
        sessionId: session.id,
      }),
    );
  });
};

export { register };
