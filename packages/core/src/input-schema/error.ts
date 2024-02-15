import { z } from "zod";

export const ErrorSchema = z.object({
  id: z.string(),
  type: z.enum(["NotFound", "InvalidInput"]),

  message: z.string(),
});
