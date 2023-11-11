import { eq } from "drizzle-orm";

import { products } from "@pachi/db";

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
        .execute()
    : await transaction
        .select({ id: products.id, version: products.version })
        .from(products)
        .where(eq(products.status, "published"))
        .execute();
  return [{ cvd: productsCVR, tableName: "products" }];
};
