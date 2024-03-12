import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Lucia, verifyRequestOrigin, type User as LuciaUser } from "lucia";

import { login, pull, push, register } from "@pachi/api";
import { type UserAuth } from "@pachi/core";
import { schema, type Country, type Currency, type Db } from "@pachi/db";
import { countries as countriesTable, currencies } from "@pachi/db/schema";
import {
  countries,
  currencies as currencies_values,
  pullRequestSchema,
  pushRequestSchema,
  subspacesSchema,
  type PushRequest,
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

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://localhost:3000"],
    allowHeaders: [
      "content-type",
      "Origin",
      "Set-Cookie",
      "x-replicache-requestid",
      "authorization",
    ],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  // CSRF middleware
  if (c.req.method === "GET") {
    return next();
  }
  const originHeader = c.req.header("Origin");
  const hostHeader = c.req.header("Host");

  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader, c.env.ORIGIN_URL])
  ) {
    return c.body(null, 403);
  }

  return next();
});

app.use("*", async (c, next) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const adapter = new DrizzlePostgreSQLAdapter(
    db,
    schema.session,
    schema.users,
  );
  const lucia = new Lucia(adapter, {
    sessionCookie: {
      name: "session",
      expires: false,
      attributes: {
        secure: c.env.ENVIRONMENT === "prod", // replaces `env` config
      },
    },
    getUserAttributes: (attributes) => {
      return {
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        username: attributes.username,
      };
    },
  });

  //IMPORTANT!
  c.set("lucia" as never, lucia);
  c.set("db" as never, db);

  const authorizationHeader = c.req.header("Authorization");
  const sessionId = lucia.readBearerToken(authorizationHeader ?? "");

  if (!sessionId) {
    c.set("user" as never, null);
    c.set("session" as never, null);

    return next();
  }
  const { session, user } = await lucia.validateSession(sessionId);
  c.set("user" as never, user);
  c.set("session" as never, session);

  return next();
});

app.post("/pull/:spaceId", async (c) => {
  const userId = (c.get("user" as never) as LuciaUser | undefined)?.id;
  const spaceId = c.req.param("spaceId");
  const subspaceIdsInput = c.req.query("subspaceId");
  const subspaceIds = subspaceIdsInput
    ? subspacesSchema.parse(JSON.parse(subspaceIdsInput))
    : undefined;
  const json = await c.req.json().then((json) => pullRequestSchema.parse(json));

  const pullEffect = pull({
    body: json,
    db: c.get("db" as never),
    spaceId: spaceId as SpaceId,
    userId: userId,
    subspaceIds: subspaceIds as never[],
  }).pipe(Effect.orDie);

  const pullResponse = await Effect.runPromise(pullEffect);

  return c.json(pullResponse, 200);
});

app.post("/push/:spaceId", async (c) => {
  const userId = (c.get("user" as never) as LuciaUser | undefined)?.id;
  const spaceId = c.req.param("spaceId");
  const db = c.get("db" as never) as Db;
  const json = pushRequestSchema.parse(await c.req.json());

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

app.post("/register", async (c) => {
  const db = c.get("db" as never) as Db;
  const lucia = c.get("lucia" as never) as Lucia;
  const { email, password } = (await c.req.json()) as UserAuth;
  const registerEffect = register({
    db,
    lucia,
    email,
    password,
  })
    .pipe(
      Effect.catchTag("InvalidInput", (error) =>
        Effect.succeed({ type: "ERROR", message: error.message }),
      ),
    )
    .pipe(Effect.orDie);
  const registerResult = await Effect.runPromise(registerEffect);

  return c.json(registerResult, 200);
});

app.post("/login", async (c) => {
  const db = c.get("db" as never) as Db;
  const lucia = c.get("lucia" as never) as Lucia;
  const { email, password } = (await c.req.json()) as UserAuth;
  const loginEffect = login({
    db,
    lucia,
    email,
    password,
  })
    .pipe(
      Effect.catchTag("InvalidInput", (error) =>
        Effect.succeed({ type: "ERROR", message: error.message }),
      ),
    )
    .pipe(Effect.orDie);
  const loginResult = await Effect.runPromise(loginEffect);

  return c.json(loginResult, 200);
});

//ADMIN ENDPOINTS
app.post("/currencies", async (c) => {
  const db = c.get("db" as never) as Db;
  const values: Currency[] = Object.values(currencies_values).map((value) => {
    return {
      code: value.code,
      symbol: value.symbol,
      symbol_native: value.symbol_native,
      name: value.name,
    };
  });
  //@ts-ignore eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await db.insert(currencies).values(values);

  return c.json({}, 200);
});

app.post("/countries", async (c) => {
  const db = c.get("db" as never) as Db;
  const values: Country[] = Object.values(countries).map((value) => {
    return {
      id: generateULID({ id: ulid(), prefix: "country" }),
      countryCode: value.alpha2,
      name: value.name,
      displayName: value.name,
    };
  });
  //@ts-ignore eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await db.insert(countriesTable).values(values);

  return c.json({}, 200);
});

app.get("/hello", async (c) => {
  return c.text("hello");
});

export default app;
