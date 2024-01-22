import { z } from "zod";

import { StoreSchema } from "@pachi/db";

export const CreateStoreSchema = z.object({
  store: StoreSchema,
});
export type CreateStore = z.infer<typeof CreateStoreSchema>;

export const UpdateStoreSchema = z.object({
    updates: StoreSchema.pick({ name: true }),
    id: z.string(),
    });
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;
