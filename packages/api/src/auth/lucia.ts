import { NeonHTTPAdapter } from "@lucia-auth/adapter-postgresql";
import { neon } from "@neondatabase/serverless";
import { Lucia } from "lucia";

const databaseUrl = process.env["DATABASE_URL"]!;
const sql = neon(databaseUrl);

const adapter = new NeonHTTPAdapter(sql, {
  user: "user",
  session: "user_session",
});

const ENV = process.env["NODE_ENV"]!;

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: ENV === "PRODUCTION", // replaces `env` config
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

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
