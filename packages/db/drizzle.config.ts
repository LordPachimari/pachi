import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: "../../.env",
});

if (!process.env["DATABASE_URL_DEV"]) {
  throw new Error("DATABASE_URL_DEV is not set");
}

export default {
  schema: "./schema",
  driver: "pg",
  out: "./migrations",
  dbCredentials: {
    connectionString:
      process.env["NODE_ENV"] === "production"
        ? `${process.env["DATABASE_URL_PROD"]}?sslmode=require`
        : process.env["NODE_ENV"] === "test"
        ? `${process.env["DATABASE_URL_TEST"]}?sslmode=require`
        : process.env["NODE_ENV"] === "staging"
        ? `${process.env["DATABASE_URL_STAGING"]}?sslmode=require`
        : `${process.env["DATABASE_URL_DEV"]}?sslmode=require`,
  },

  tablesFilter: ["t3turbo_*"],
  strict: true,
  verbose: true,
} satisfies Config;
