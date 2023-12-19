/* eslint-disable @typescript-eslint/require-await */
"use server";

import { cookies } from "next/headers";

export async function setUserIdCookie(userId: string) {
  cookies().set("user_id", userId);
}
