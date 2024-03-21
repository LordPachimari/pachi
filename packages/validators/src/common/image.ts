import { z } from "zod";

export const ImageSchema = z.object({
  id: z.string(),
  altText: z.string(),
  order: z.number(),
  url: z.string(),
});
export type Image = z.infer<typeof ImageSchema>;