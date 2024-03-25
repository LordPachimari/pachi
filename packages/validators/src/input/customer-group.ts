import type { z } from "zod";

import { CustomerGroupSchema } from "../server";

export const CustomerGroupUpdatesSchema = CustomerGroupSchema.pick({
  name: true,
  description: true,
});
export type CustomerGroupUpdates = z.infer<typeof CustomerGroupUpdatesSchema>;
