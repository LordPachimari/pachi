import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import { Effect } from "effect"
import { Hono } from "hono"
import { cors } from "hono/cors"
import {
  generateId,
  Lucia,
  Scrypt,
  verifyRequestOrigin,
  type User as LuciaUser,
} from "lucia"

import { pull, push } from "@pachi/api"
import { UserAuthSchema, type UserAuth } from "@pachi/core"
import {
  schema,
  type Country,
  type Currency,
  type Db,
  type User,
} from "@pachi/db"
import {
  countries as countriesTable,
  currencies,
  users,
} from "@pachi/db/schema"
import {
  countries,
  currencies as currencies_values,
  SpaceIdSchema,
  type SpaceId,
} from "@pachi/types"
import { generateId as generateULID, ulid } from "@pachi/utils"

export type Bindings = {
  ORIGIN_URL: string
  DATABASE_URL: string
  ENVIRONMENT: "prod" | "test" | "staging" | "dev"
  PACHI: KVNamespace
  PACHI_PROD: KVNamespace
  HANKO_URL: string
  PACHI_BUCKET: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()
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
)

app.use("*", async (c, next) => {
  // CSRF middleware
  if (c.req.method === "GET") {
    return next()
  }
  const originHeader = c.req.header("Origin")
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = c.req.header("Host")
  console.log("originHeader", originHeader)
  console.log("hostHeader", hostHeader)
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader, c.env.ORIGIN_URL])
  ) {
    return c.body(null, 403)
  }
  return next()
})

app.use("*", async (c, next) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL })
  const db = drizzle(pool, { schema })
  const adapter = new DrizzlePostgreSQLAdapter(db, schema.session, schema.users)
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
        // @ts-ignore
        username: attributes.username,
      }
    },
  })

  //IMPORTANT!
  c.set("lucia" as never, lucia)
  c.set("db" as never, db)

  const authorizationHeader = c.req.header("Authorization")
  console.log("authorizationHeader", authorizationHeader)
  const sessionId = lucia.readBearerToken(authorizationHeader ?? "")
  if (!sessionId) {
    c.set("user" as never, null)
    c.set("session" as never, null)

    return next()
  }
  const { session, user } = await lucia.validateSession(sessionId)
  c.set("user" as never, user)
  c.set("session" as never, session)
  return next()
})

app.post("/pull/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test"
      ? c.req.query("userId")
      : (c.get("user" as never) as LuciaUser | undefined)?.id
  console.log("userId", userId)
  const spaceId = c.req.param("spaceId")
  const subspaceId = c.req.query("subspaceId")
  const { success } = SpaceIdSchema.safeParse(spaceId)
  if (!success) {
    return c.json({ message: "Invalid spaceId" }, 400)
  }
  const json = await c.req.json()

  const pullEffect = pull({
    body: json,
    db: c.get("db" as never),
    spaceId: spaceId as SpaceId,
    userId: userId,
    subspaceIds: subspaceId ? JSON.parse(subspaceId) : undefined,
  }).pipe(Effect.orDie)
  const pullResponse = await Effect.runPromise(pullEffect)
  return c.json(pullResponse, 200)
})
app.post("/push/:spaceId", async (c) => {
  const userId =
    c.env.ENVIRONMENT === "test"
      ? c.req.query("userId")
      : (c.get("user" as never) as LuciaUser | undefined)?.id
  console.log("userId", userId)

  const spaceId = c.req.param("spaceId")
  const { success } = SpaceIdSchema.safeParse(spaceId)
  if (!success) {
    return c.json({ message: "Invalid spaceId" }, 400)
  }
  const json = await c.req.json()
  console.log("req.body", json)

  const pushEffect = push({
    body: json,
    db: c.get("db" as never),
    spaceId: spaceId as SpaceId,
    userId: userId,
    requestHeaders: {
      ip: c.req.raw.headers.get("cf-connecting-ip"),
      userAgent: c.req.raw.headers.get("user-agent"),
    },
  }).pipe(Effect.orDie)
  await Effect.runPromise(pushEffect)
  return c.json({}, 200)
})
app.post("/currencies", async (c) => {
  const db = c.get("db" as never)
  const values: Currency[] = Object.values(currencies_values).map((value) => {
    return {
      code: value.code,
      symbol: value.symbol,
      symbol_native: value.symbol_native,
      name: value.name,
    }
  })
  //@ts-ignore
  await db.insert(currencies).values(values)
  return c.json({}, 200)
})

app.post("/countries", async (c) => {
  const db = c.get("db" as never)
  const values: Country[] = Object.values(countries).map((value) => {
    return {
      id: generateULID({ id: ulid(), prefix: "country" }),
      countryCode: value.alpha2,
      name: value.name,
      displayName: value.name,
    }
  })
  //@ts-ignore
  await db.insert(countriesTable).values(values)
  return c.json({}, 200)
})
app.get("/username/:id", async (c) => {
  const db = c.get("db" as never) as Db
  const user = await db.query.users.findFirst({
    columns: {
      username: true,
    },
    where: (users, { eq }) => eq(users.id, c.req.param("id")),
  })
  return c.json({ username: user?.username }, 200)
})

app.post("/register", async (c) => {
  const db = c.get("db" as never) as Db
  const { email, password } = (await c.req.json()) as UserAuth

  try {
    UserAuthSchema.parse({
      email,
      password,
    })

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return c.json({ message: "Invalid password" }, 400)
    }
    const createdAt = new Date().toISOString()
    const hashedPassword = await new Scrypt().hash(password)
    const newUser: User = {
      id: generateId(15),
      email,
      createdAt,
      hashedPassword,
    }
    //@ts-ignore
    await db.insert(users).values(newUser)
    const lucia = c.get("lucia" as never) as Lucia
    const session = await lucia.createSession(newUser.id, {
      country: "AU",
    })

    return c.json(
      {
        type: "SUCCESS",
        message: "Successfully created user",
        sessionId: session.id,
      },
      200,
    )
  } catch (error) {
    console.log(error)
    if ((error as { code: string }).code === "23505")
      return c.json({ type: "ERROR", message: "User already created" }, 400)
    return c.json({ type: "ERROR", message: "Failed to create user" }, 400)
  }
})
app.post("/login", async (c) => {
  const db = c.get("db" as never) as Db
  const { email, password } = (await c.req.json()) as UserAuth

  try {
    UserAuthSchema.parse({
      email,
      password,
    })

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return c.json({ type: "ERROR", message: "Invalid password" }, 400)
    }
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })
    if (!user) {
      return c.json({ type: "ERROR", message: "Email does not exist" }, 400)
    }
    const validPassword = await new Scrypt().verify(
      user.hashedPassword,
      password,
    )
    if (!validPassword) {
      return c.json({ type: "ERROR", message: "Invalid password" }, 400)
    }
    const lucia = c.get("lucia" as never) as Lucia
    const session = await lucia.createSession(user.id, {
      country: "AU",
    })

    console.log("blank session", lucia.createBlankSessionCookie().serialize())
    return c.json(
      {
        type: "SUCCESS",
        message: "Successfully logged in",
        sessionId: session.id,
      },
      200,
    )
  } catch (error) {
    console.log(error)
    return c.json({ type: "ERROR", message: "Failed to login" }, 400)
  }
})

app.get("/hello", async (c) => {
  return c.text("hello")
})
export default app
