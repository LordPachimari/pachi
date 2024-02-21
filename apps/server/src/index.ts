import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Effect } from "effect";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { generateId, Lucia, verifyRequestOrigin } from "lucia";
import { Argon2id } from "oslo/password";
import { z } from "zod";

import { adapter, pull, push } from "@pachi/api";
import { schema, type Country, type Currency, type User } from "@pachi/db";
import {
  countries as countriesTable,
  currencies,
  stores,
  users,
} from "@pachi/db/schema";
import {
  countries,
  currencies as currencies_values,
  SpaceIdSchema,
  type SpaceId,
} from "@pachi/types";
import { generateId as generateULID, ulid } from "@pachi/utils";

export type Bindings = {
  ORIGIN_URL: string;
  DATABASE_URL: string;
  ENVIRONMENT: "prod" | "test" | "staging" | "dev";
  PACHI: KVNamespace;
  PACHI_PROD: KVNamespace;
  HANKO_URL: string;
  PACHI_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());
app.use("/*", async (c, next) => {
  cors({
    origin:
      c.env.ENVIRONMENT === "dev" || c.env.ENVIRONMENT === "test"
        ? "*"
        : c.env.ORIGIN_URL,
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  });
  return await next();
});
app.use("*", async (c, next) => {
  // CSRF middleware
  if (c.req.method === "GET") {
    return next();
  }
  const originHeader = c.req.header("Origin");
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = c.req.header("Host");
  console.log("originHeader", originHeader);
  console.log("hostHeader", hostHeader);
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return c.body(null, 403);
  }
  return next();
});

app.use("*", async (c, next) => {
  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: c.env.ORIGIN_URL === "PRODUCTION", // replaces `env` config
      },
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username,
      };
    },
  });
  c.set("lucia" as never, lucia);

  const sessionId = getCookie(c, lucia.sessionCookieName);
  if (!sessionId) {
    c.set("user" as never, null);
    c.set("session" as never, null);
    return next();
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    // use `header()` instead of `setCookie()` to avoid TS errors
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }
  c.set("user" as never, user);
  c.set("session" as never, session);
  return next();
});

app.post("/pull/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test" || c.env.ENVIRONMENT === "dev"
      ? c.req.query("userId")
      : c.get("auth" as never);
  console.log("userId", userId);
  const spaceId = c.req.param("spaceId");
  const subspaceId = c.req.query("subspaceId");
  const { success } = SpaceIdSchema.safeParse(spaceId);
  if (!success) {
    return c.json({ message: "Invalid spaceId" }, 400);
  }
  const json = await c.req.json();

  const pool = new Pool({ connectionString: c.env.DATABASE_URL });

  const db = drizzle(pool, { schema });

  const pullEffect = pull({
    body: json,
    db,
    spaceId: spaceId as SpaceId,
    userId: userId,
    subspaceIds: subspaceId ? JSON.parse(subspaceId) : undefined,
  }).pipe(Effect.orDie);
  const pullResponse = await Effect.runPromise(pullEffect);
  return c.json(pullResponse, 200);
});
app.post("/push/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test" || c.env.ENVIRONMENT === "dev"
      ? c.req.query("userId")
      : c.get("auth" as never);
  console.log("userId", userId);

  const spaceId = c.req.param("spaceId");
  const { success } = SpaceIdSchema.safeParse(spaceId);
  if (!success) {
    return c.json({ message: "Invalid spaceId" }, 400);
  }
  const json = await c.req.json();
  console.log("req.body", json);

  const pool = new Pool({ connectionString: c.env.DATABASE_URL });

  const db = drizzle(pool, { schema });

  const pushEffect = push({
    body: json,
    db,
    spaceId: spaceId as SpaceId,
    userId: userId,
    requestHeaders: {
      ip: c.req.raw.headers.get("cf-connecting-ip"),
      userAgent: c.req.raw.headers.get("user-agent"),
    },
  }).pipe(Effect.orDie);
  await Effect.runPromise(pushEffect);
  return c.json({}, 200);
});
app.post("/currencies", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const values: Currency[] = Object.values(currencies_values).map((value) => {
    return {
      code: value.code,
      symbol: value.symbol,
      symbol_native: value.symbol_native,
      name: value.name,
    };
  });
  //@ts-ignore
  await db.insert(currencies).values(values);
  return c.json({}, 200);
});

app.post("/countries", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const values: Country[] = Object.values(countries).map((value) => {
    return {
      id: generateULID({ id: ulid(), prefix: "country" }),
      countryCode: value.alpha2,
      name: value.name,
      displayName: value.name,
    };
  });
  //@ts-ignore
  await db.insert(countriesTable).values(values);
  return c.json({}, 200);
});
app.get("/username/:id", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const user = await db.query.users.findFirst({
    columns: {
      username: true,
    },
    where: (users, { eq }) => eq(users.id, c.req.param("id")),
  });
  return c.json({ username: user?.username }, 200);
});

app.post("/register", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const { email, password } = (await c.req.json()) as {
    email: string;
    password: string;
  };

  try {
    z.object({
      email: z.string().email(),
      password: z.string(),
    }).parse({
      email,
      password,
    });

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return c.json({ message: "Invalid password" }, 400);
    }
    const createdAt = new Date().toISOString();
    const hashedPassword = await new Argon2id().hash(password);
    const newUser: User = {
      id: generateId(15),
      email,
      createdAt,
      hashedPassword,
    };

    //@ts-ignore
    await db.insert(users).values(newUser);
    const lucia = c.get("lucia" as never) as Lucia | undefined;
    if (lucia) {
      const session = await lucia.createSession(newUser.id, {
        country: "AU",
      });
      c.header(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
        {
          append: true,
        },
      );
    }
    return c.json(
      { type: "SUCCESS", message: "Successfully created user" },
      200,
    );
  } catch (error) {
    console.log(error);
    if ((error as { code: string }).code === "23505")
      return c.json({ type: "ERROR", message: "User already created" }, 400);
    return c.json({ type: "ERROR", message: "Failed to create user" }, 400);
  }
});
app.post("/login", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const { email, password } = (await c.req.json()) as {
    email: string;
    password: string;
  };

  try {
    z.object({
      email: z.string().email(),
      password: z.string(),
    }).parse({
      email,
      password,
    });

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return c.json({ type: "ERROR", message: "Invalid password" }, 400);
    }
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    if (!user) {
      return c.json({ type: "ERROR", message: "Email does not exist" }, 400);
    }
    const validPassword = await new Argon2id().verify(
      user.hashedPassword,
      password,
    );
    if (!validPassword) {
      return c.json({ type: "ERROR", message: "Invalid password" }, 400);
    }
    const lucia = c.get("lucia" as never) as Lucia | undefined;
    if (lucia) {
      const session = await lucia.createSession(user.id, {
        country: "AU",
      });
      c.header(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
        {
          append: true,
        },
      );
    }
    return c.json(
      { type: "SUCCESS", message: "Successfully logged in", user },
      200,
    );
  } catch (error) {
    console.log(error);
    return c.json({ type: "ERROR", message: "Failed to login" }, 400);
  }
});

app.post("/create-user", async (c) => {});
app.get("/hello", async (c) => {
  return c.text("hello");
});
export default app;
