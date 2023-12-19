"use server";

import { cookies } from "next/headers";
import * as jose from "jose";

import { env } from "~/env.mjs";

// eslint-disable-next-line @typescript-eslint/require-await
export async function getUserId(): Promise<string | undefined> {
  const token = cookies().get("hanko")?.value;

  const payload = token ? jose.decodeJwt(token) : undefined;

  const userId = payload ? payload.sub : undefined;

  return userId;
}
export async function getUsername(
  userId: string | undefined,
): Promise<string | undefined> {
  if (!userId) return undefined;
  const response = await fetch(`${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/${userId}`);
  const usernameObj = (await response.json()) as {
    username: string | undefined;
  };

  return usernameObj.username;
}
