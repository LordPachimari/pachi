import { z } from "zod";
import { Server } from "../../..";


export const CreateStoreSchema = z.object({
  store: Server.StoreSchema,
});
export type CreateStore = z.infer<typeof CreateStoreSchema>;
export const UpdateStoreSchema = z.object({
  updates: Server.StoreSchema.pick({ name: true, currencies: true }).partial(),
  id: z.string(),
});
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;
