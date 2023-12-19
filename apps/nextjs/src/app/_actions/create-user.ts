"use server";

import { cookies } from "next/headers";
import * as jose from "jose";
import { z } from "zod";

import { env } from "~/env.mjs";

export async function createUser(
  _: unknown,
  formData: FormData,
): Promise<{
  message: string;
  type: "SUCCESS" | "FAIL" | "NONE";
}> {
  try {
    const schema = z.object({
      username: z.string().min(1),
    });
    const data = schema.parse({
      username: formData.get("username"),
    });

    const token = cookies().get("hanko")?.value;
    if (!token)
      return {
        message: "Please authenticate before creating a user",
        type: "FAIL",
      };
    const payload = jose.decodeJwt(token);

    const userID = payload.sub;

    // const hankoUserResponse = await fetch(
    //   `${env.NEXT_PUBLIC_HANKO_API_URL}/users/${userID}`,
    //   options,
    // );
    // const hankoUser = (await hankoUserResponse.json()) as { email: string };
    // console.log("hankoUser", JSON.stringify(hankoUser));
    const createUserReponse = await fetch(
      `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/create-user`,
      {
        method: "POST",
        body: JSON.stringify({
          username: data.username,
          email: "rwthunder123@gmail.com",
          userId: userID,
        }),
      },
    );
    if (createUserReponse.status === 400)
      return { message: "User already exists", type: "FAIL" };
    const userReponse = (await createUserReponse.json()) as { message: string };

    return { message: userReponse.message, type: "SUCCESS" };
  } catch (e) {
    console.log(e);
    return { message: "Failed to create user", type: "FAIL" };
  }
}
