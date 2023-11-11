import { eq } from "drizzle-orm";

import { product_collections } from "@pachi/db";
import { generateId } from "@pachi/utils";

import type { GetClientViewData } from "../../types";

export const productCollectionCVD: GetClientViewData = async ({
  transaction,
  userId,
  isFullItems = false,
}) => {
  if (!userId) return [{ cvd: [], tableName: "product_collections" }];
  const adminCollections = isFullItems
    ? await transaction
        .select()
        .from(product_collections)
        .where(
          eq(
            product_collections.store_id,
            generateId({ id: userId, prefix: "st" }),
          ),
        )
        .execute()
    : await transaction
        .select({
          id: product_collections.id,
          version: product_collections.version,
        })
        .from(product_collections)
        .where(
          eq(
            product_collections.store_id,
            generateId({ id: userId, prefix: "st" }),
          ),
        )
        .execute();

  return [{ cvd: adminCollections, tableName: "product_collections" }];
};
