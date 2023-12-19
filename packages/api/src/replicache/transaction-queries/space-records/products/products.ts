import { eq } from "drizzle-orm";

import { products } from "@pachi/db/schema";

import type { GetClientViewData } from "../../types";

export const productsCVD: GetClientViewData = async ({
  transaction,
  isFullItems = false,
}) => {
  const productsCVR = isFullItems
    ? await transaction
        .select()
        .from(products)
        .where(eq(products.status, "published"))
    : await transaction
        .select({ id: products.id, version: products.version })
        .from(products)
        .where(eq(products.status, "published"));
  return [{ cvd: productsCVR, tableName: "products" }];
};
