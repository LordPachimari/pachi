"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import type { UserAuth } from "@pachi/validators";

import { LUCIA_COOKIE_NAME } from "~/constants";
import { env } from "~/env.mjs";

async function register({ email, password }: UserAuth) {
  const { message, type, sessionId } = await fetch(
    `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/register`,
    {
      headers: {
        "Content-Type": "application/json",
        Origin: env.NEXT_PUBLIC_APP_URL,
      },
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      cache: "no-store",
    },
  )
    .then((res) => res.json())
    .then((data) => {
      return z
        .object({
          type: z.enum(["SUCCESS", "ERROR"] as const),
          message: z.string(),
          sessionId: z.string().optional(),
        })
        .parse(data);
    });

  if (sessionId) cookies().set(LUCIA_COOKIE_NAME, sessionId);

  return { message, type, sessionId };
}

export { register };
