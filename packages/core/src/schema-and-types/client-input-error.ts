import { boolean, object, optional, string, type Output } from "valibot";

export const ClientInputErrorSchema = object({
  error: boolean(),
  message: optional(string()),
});
export type CLientInputError = Output<typeof ClientInputErrorSchema>;
