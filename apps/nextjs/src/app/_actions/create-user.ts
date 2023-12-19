import { z } from "zod";

import { env } from "~/env.mjs";

export async function createUser(prevState: any, formData: FormData) {
  console.log(prevState);
  const schema = z.object({
    username: z.string().min(1),
  });
  const data = schema.parse({
    username: formData.get("username"),
  });

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/create-user`,
      {
        body: JSON.stringify(data),
      },
    );
    const json = (await response.json()) as { message: string };
    return { message: json.message };
  } catch (e) {
    return { message: "Failed to create user" };
  }
}
