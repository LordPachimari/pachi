import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Hono, type Context } from "hono";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import * as jose from "jose";

import { pull, push, type Bindings } from "@pachi/api";
import {
  countries as countries_table,
  currencies,
  schema,
  stores,
  users,
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
  if (c.env.ENVIRONMENT === "test" || c.env.ENVIRONMENT === "dev") {
    return await next();
  }
  const jwt = getToken(c);
  const JWKS_ENDPOINT = `${c.env.HANKO_URL}/.well-known/jwks.json`;
  const JWKS = jose.createRemoteJWKSet(new URL(JWKS_ENDPOINT), {
    cooldownDuration: 120000,
  });
  if (jwt) {
    try {
      const { payload } = await jose.jwtVerify(jwt, JWKS);
      console.log("what is payload sub?", payload.sub);
      c.set("auth" as never, payload.sub);
    } catch (error) {
      return c.newResponse("Invalid token", { status: 403 });
    }
  }
  return await next();
});
app.post("/pull/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test"
      ? c.req.query("userId")
      : c.get("auth" as never);
  console.log("userId", userId);
  const allCookies = getCookie(c);
  console.log("all cookies", allCookies);
  const unauthenticated_user_id = c.req.query("username") as string;
  console.log("unauthenticated_user_id", unauthenticated_user_id);
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

  const pullResponse = await pull({
    body: json,
    db,
    spaceId: c.req.param("spaceId") as SpaceId,
    storage: c.env.PACHI,
    userId: userId ?? unauthenticated_user_id,
  });
  return c.json(pullResponse, 200);
});
app.post("/push/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test"
      ? c.req.query("userId")
      : c.get("auth" as never);

  const unauthenticated_user_id = c.req.query("userId") as string;
  console.log("unauthenticated_user_id", unauthenticated_user_id);

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
    userId: userId ?? unauthenticated_user_id,
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
      code: value.code.toLowerCase(),
      symbol: value.symbol,
      symbol_native: value.symbol_native,
      name: value.name,
    };
  });
  //@ts-ignore
  await db.insert(currencies).values(values).execute();
  return c.json({}, 200);
});

app.post("/countries", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const values: Country[] = Object.values(countries).map((value) => {
    return {
      id: generateId({ id: ulid(), prefix: "country" }),
      iso_2: value.alpha2,
      iso_3: value.alpha3,
      name: value.name,
      display_name: value.name,
    };
  });
  //@ts-ignore
  await db.insert(countries_table).values(values).execute();
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
  const { email, id, username } = (await c.req.json()) as {
    username: string;
    email: string;
    id: string;
  };
  const created_at = new Date().toISOString();
  const new_user: User = {
    id,
    username,
    email,
    created_at,
  };
  const new_store: Store = {
    id: generateId({ id: ulid(), prefix: "store" }),
    name: username,
    founder_id: id,
    version: 0,
    created_at,
  };
  try {
    await Promise.all([
      //@ts-ignore
      db.insert(users).values(new_user).execute(),
      //@ts-ignore
      db.insert(stores).values(new_store).execute(),
    ]);
  } catch (error) {
    console.log(error);
    return c.json({ message: "Failed to create user" }, 400);
  }
  return c.status(200);
});
export default app;
