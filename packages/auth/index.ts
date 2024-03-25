import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Lucia, type User as LuciaUser } from "lucia";

import { session, users } from "@pachi/db/schema";

const databaseUrl = process.env["DATABASE_URL"]!;
const pool = new Pool({
  connectionString: databaseUrl,
});
const db = drizzle(pool);

const adapter = new DrizzlePostgreSQLAdapter(db, session, users);

const ENV = process.env["NODE_ENV"]!;

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "session",
    expires: false,
    attributes: {
      secure: ENV === "production", // replaces `env` config
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});
export type { LuciaUser };

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {
  country: string;
}

interface DatabaseUserAttributes {
  username: string;
}
