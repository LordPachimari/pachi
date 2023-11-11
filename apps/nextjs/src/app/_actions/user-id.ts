"use server";

import { cookies } from "next/headers";
import * as jose from "jose";
import { string } from "valibot";

import { env } from "~/env.mjs";

// eslint-disable-next-line @typescript-eslint/require-await
export async function userId() {
  const token = cookies().get("hanko")?.value;
  const unauthenticated_user_id = cookies().get("user_id")?.value;
  console.log(
    "---------------------------> unauthenticated",
    unauthenticated_user_id,
  );

  const payload = token ? jose.decodeJwt(token) : undefined;

  const userID = payload ? payload.sub : undefined;
  console.log("---------------------------> userId", userID);

  if (userID) return userID;
  else if (unauthenticated_user_id) return unauthenticated_user_id;
  else return undefined;
}
export async function getUsername(user_id: string | undefined) {
  console.log("user_id", user_id);
  if (!user_id) return undefined;
  string()._parse(user_id);
  if (user_id.startsWith("unauthenticated")) return user_id;
  const response = await fetch(
    `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/${user_id}`,
  );
  const usernameObj = (await response.json()) as { username: string };

  return usernameObj.username ?? user_id;
}
