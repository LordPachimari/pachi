"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { z } from "zod";

import { lucia } from "@pachi/api";
import { db, type User } from "@pachi/db";
import { users } from "@pachi/db/schema";

async function register(_: any, formData: FormData) {
  const email = formData.get("email");
  const parsedEmail = z.string().email().safeParse(email);
  if (!parsedEmail.success) {
    return {
      error: "Invalid email",
    };
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);
  const createdAt = new Date().toISOString();
  const newUser: User = {
    id: generateId(15),
    email: parsedEmail.data,
    createdAt,
    hashedPassword,
  };
  //@ts-ignore
  await db.insert(users).values(newUser);

  const session = await lucia.createSession(userId, {
    country: "AU",
  });
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}
export { register };
