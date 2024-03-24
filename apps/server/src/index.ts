import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Lucia, verifyRequestOrigin, type User as LuciaUser } from "lucia";

import { login, pull, push, register } from "@pachi/api";
import { schema, type Db } from "@pachi/db";
import { countries as countriesTable, currencies } from "@pachi/db/schema";
import { generateId as generateULID, ulid } from "@pachi/utils";
import {
  countries,
  currencies as currenciesValues,
  pullRequestSchema,
  pushRequestSchema,
  SpaceIDSchema,
  UserAuthSchema,
  type Server,
  type SpaceRecord,
  type UserAuth,
} from "@pachi/validators";

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
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// CSRF middleware
app.use("*", async (c, next) => {
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
  });

  // IMPORTANT!
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

app.post("/pull/:spaceID", async (c) => {
  // 1: PARSE INPUT
  const db = c.get("db" as never) as Db;
  const subspaceIDs = c.req.queries("subspaces");
  const userID = (c.get("user" as never) as LuciaUser | undefined)?.id;
  const spaceID = SpaceIDSchema.parse(c.req.param("spaceID"));
  const body = pullRequestSchema.parse(await c.req.json());

  // 2: PULL
  const pullEffect = pull({
    body,
    db,
    spaceID,
    userID,
    subspaceIDs: subspaceIDs as Array<SpaceRecord[typeof spaceID][number]>,
  }).pipe(Effect.orDie);

  // 3: RUN PROMISE
  const pullResponse = await Effect.runPromise(pullEffect);

  return c.json(pullResponse, 200);
});

app.post("/push/:spaceID", async (c) => {
  // 1: PARSE INPUT
  const userID = (c.get("user" as never) as LuciaUser | undefined)?.id;
  const db = c.get("db" as never) as Db;
  const spaceID = SpaceIDSchema.parse(c.req.param("spaceID"));
  const body = pushRequestSchema.parse(await c.req.json());

  // 2: PULL
  const pushEffect = push({
    body,
    db,
    spaceID,
    userID,
    requestHeaders: {
      ip: c.req.raw.headers.get("cf-connecting-ip"),
      userAgent: c.req.raw.headers.get("user-agent"),
    },
  }).pipe(Effect.orDie);

  // 3: RUN PROMISE
  await Effect.runPromise(pushEffect);

  return c.json({}, 200);
});

app.post("/register", async (c) => {
  // 1: GET INPUT
  const db = c.get("db" as never) as Db;
  const lucia = c.get("lucia" as never) as Lucia;

  // value is parsed in registerEffect for error handling
  const { email, password } = (await c.req.json()) as UserAuth;

  // 2: REGISTER
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

  // 3: RUN PROMISE
  const registerResult = await Effect.runPromise(registerEffect);

  return c.json(registerResult, 200);
});

app.post("/login", async (c) => {
  // 1: PARSE INPUT
  const db = c.get("db" as never) as Db;
  const lucia = c.get("lucia" as never) as Lucia;
  const { email, password } = UserAuthSchema.parse(await c.req.json());

  // 2: LOGIN
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

  // 3: RUN PROMISE
  const loginResult = await Effect.runPromise(loginEffect);

  return c.json(loginResult, 200);
});

//ADMIN ENDPOINTS
app.post("/currencies", async (c) => {
  // 1: GET INPUT
  const db = c.get("db" as never) as Db;
  const values: Server.Currency[] = Object.values(currenciesValues).map(
    (value) => {
      return {
        code: value.code,
        symbol: value.symbol,
        name: value.name,
      };
    },
  );

  // 2: INSERT
  //@ts-ignore
  await db.insert(currencies).values(values).onConflictDoNothing();

  return c.json({}, 200);
});

app.post("/countries", async (c) => {
  // 1: GET INPUT
  const db = c.get("db" as never) as Db;
  const values: Server.Country[] = Object.values(countries).map((value) => {
    return {
      id: generateULID({ id: ulid(), prefix: "country" }),
      countryCode: value.alpha2,
      name: value.name,
      displayName: value.name,
    };
  });

  // 2: INSERT
  //@ts-ignore
  await db.insert(countriesTable).values(values).onConflictDoNothing();

  return c.json({}, 200);
});

app.get("/hello", (c) => {
  return c.text("hello");
});

export default app;
