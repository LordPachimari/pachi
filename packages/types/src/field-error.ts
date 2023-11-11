import { boolean, object, optional, string, type Output } from "valibot";

export const FieldErrorSchema = object({
  error: boolean(),
  message: optional(string()),
});
export type FieldError = Output<typeof FieldErrorSchema>;
