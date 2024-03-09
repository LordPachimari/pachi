import { z } from "zod"

import { UserSchema } from "@pachi/db"

export const CreateUserSchema = z.object({
  user: UserSchema,
})
export type CreateUser = z.infer<typeof CreateUserSchema>

export const UserAuthSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
})
export type UserAuth = z.infer<typeof UserAuthSchema>
