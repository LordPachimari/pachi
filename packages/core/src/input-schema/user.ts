import { z } from "zod";

import { UserSchema } from "@pachi/db";

export const CreateUserSchema = z.object({
  user: UserSchema,
});
export type CreateUser = z.infer<typeof CreateUserSchema>;
