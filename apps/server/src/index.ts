import { pg } from "@lucia-auth/adapter-postgresql";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Hono, type Context } from "hono";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import * as jose from "jose";
import { lucia } from "lucia";
import { hono } from "lucia/middleware";
import { number, object, string } from "valibot";

import { pull, push, type Bindings } from "@pachi/api";
import {
  pool,
  schema,
  type Country,
  type Currency,
  type Store,
  type User,
} from "@pachi/db";
import {
  countries,
  currencies as currencies_values,
  SpaceIdSchema,
  type SpaceId,
} from "@pachi/types";
import { generateId, ulid } from "@pachi/utils";

function getToken(
  c: Context<
    {
      Bindings: Bindings;
    },
    "*",
    {}
  >,
): string | undefined {
  const cookie = getCookie(c, "hanko");
  const authorization = c.req.raw.headers.get("authorization");
  if (authorization && authorization.split(" ")[0] === "Bearer")
    return authorization.split(" ")[1];
  else if (cookie) return cookie;
  return undefined;
}
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
  const auth = lucia({
    env: "DEV", // "PROD" if deployed to HTTPS
    middleware: hono(),
    adapter: pg(pool, {
      user: "users",
      key: "user_key",
      session: "user_sessions",
    }),
  });
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  console.log("session", session);
  c.set("auth" as never, session.user as { userId: string });

  return await next();
});
app.post("/pull/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test"
      ? c.req.query("userId")
      : c.get("auth" as never);
  console.log("userId", userId);
  try {
    SpaceIdSchema._parse(c.req.param("spaceId"));
  } catch (error) {
    console.log(error);
    return c.json({ message: "Invalid spaceId" }, 400);
  }
  const json = await c.req.json();

  const pool = new Pool({ connectionString: c.env.DATABASE_URL });

  const db = drizzle(pool, { schema });

  const pullResponse = await pull({
    body: json,
    db,
    spaceId: c.req.param("spaceId") as SpaceId,
    storage: c.env.PACHI,
    userId: userId,
  });
  return c.json(pullResponse, 200);
});
app.post("/push/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test"
      ? c.req.query("userId")
      : c.get("auth" as never);
  console.log("userId", userId);

  try {
    SpaceIdSchema._parse(c.req.param("spaceId"));
  } catch (error) {
    console.log(error);
    return c.json({ message: "Invalid spaceId" }, 400);
  }
  const json = await c.req.json();
  console.log("req.body", json);

  const pool = new Pool({ connectionString: c.env.DATABASE_URL });

  const db = drizzle(pool, { schema });

  await push({
    body: json,
    db,
    spaceId: c.req.param("spaceId") as SpaceId,
    storage: c.env.PACHI,
    userId: userId,
    requestHeaders: {
      ip: c.req.raw.headers.get("cf-connecting-ip"),
      userAgent: c.req.raw.headers.get("user-agent"),
    },
    env: c.env,
  });
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
      id: generateId({ id: ulid(), prefix: "country" }),
      iso2: value.alpha2,
      iso3: value.alpha3,
      name: value.name,
      displayName: value.name,
    };
  });
  //@ts-ignore
  await db.insert(countries_table).values(values);
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
app.post("/create-user", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const { email, userId, username } = (await c.req.json()) as {
    username: string;
    email: string;
    userId: string;
  };

  try {
    object({ username: string(), email: string(), userId: string() })._parse({
      username,
      email,
      userId,
    });
    const createdAt = new Date().toISOString();
    const newUser: User = {
      id: userId,
      username,
      email,
      createdAt,
    };
    const newStore: Store = {
      id: generateId({ id: ulid(), prefix: "store" }),
      name: username,
      founderId: userId,
      version: 0,
      createdAt,
    };
    await Promise.all([
      //@ts-ignore
      db.insert(users).values(newUser),
      //@ts-ignore
      db.insert(stores).values(newStore),
    ]);
    return c.json({ message: "Successfully created user" }, 200);
  } catch (error) {
    console.log(error);
    console.log("CODE", (error as { code: number }).code);
    if ((error as { code: string }).code === "23505")
      return c.json({ message: "User already created" }, 400);
    return c.json({ message: "Failed to create user" }, 400);
  }
});
app.get("/hello", async (c) => {
  return c.text("hello");
});
export default app;
