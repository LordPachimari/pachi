import { pg } from "@lucia-auth/adapter-postgresql";
import { lucia } from "lucia";
import { web } from "lucia/middleware";

import { pool } from "@pachi/db";

// expect error (see next section)
export const auth = lucia({
  env: "DEV", // "PROD" if deployed to HTTPS
  middleware: web(),
  adapter: pg(pool, {
    user: "users",
    key: "user_key",
    session: "user_sessions",
  }),
});

export type Auth = typeof auth;
