import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

import { pull, push } from "@pachi/api";
import {
  schema,
  type Country,
  type Currency,
  type Store,
  type User,
} from "@pachi/db";
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
import { generateId, ulid } from "@pachi/utils";

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
// app.use("*", async (c, next) => {
//   if (c.env.ENVIRONMENT === "test") {
//     return await next();
//   }
//   const jwt = getCookie(c, "hanko");
//   const JWKS_ENDPOINT = `${c.env.HANKO_URL}/.well-known/jwks.json`;
//   const JWKS = jose.createRemoteJWKSet(new URL(JWKS_ENDPOINT), {
//     cooldownDuration: 120000,
//   });
//   if (jwt) {
//     try {
//       const { payload } = await jose.jwtVerify(jwt, JWKS);
//       console.log("what is payload sub?", payload.sub);
//       c.set("auth" as never, payload.sub);
//     } catch (error) {
//       console.log(error);
//     }
//   }
//   return await next();
// });
app.post("/pull/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test" || c.env.ENVIRONMENT === "dev"
      ? c.req.query("userId")
      : c.get("auth" as never);
  console.log("userId", userId);
  const spaceId = c.req.param("spaceId");
  const subspaceId = c.req.query("subspaceId");
  const SubspaceIdSchema = z.array(z.string()).optional();
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
      id: generateId({ id: ulid(), prefix: "country" }),
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

app.post("/create-user", async (c) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const { email, userId, username } = (await c.req.json()) as {
    username: string;
    email: string;
    userId: string;
  };

  try {
    z.object({
      username: z.string(),
      email: z.string(),
      userId: z.string(),
    }).parse({
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
      id: generateId({ id: username, prefix: "store" }),
      name: username,
      founderId: userId,
      version: 0,
      createdAt,
    };
    //@ts-ignore
    await db.insert(users).values(newUser),
      //@ts-ignore
      await db.insert(stores).values(newStore);
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
