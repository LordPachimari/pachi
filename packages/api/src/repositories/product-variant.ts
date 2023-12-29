import { eq } from "drizzle-orm";

import type { ProductVariant } from "@pachi/db";
import { productVariants } from "@pachi/db/schema";

import { RepositoryBase } from "./base";

export class ProductVariantRepository extends RepositoryBase {
  async getProductVariantById({
    id,
    withProduct,
  }: {
    id: string;
    withProduct?: boolean;
  }) {
    return await this.manager.query.productVariants.findFirst({
      where: (variant) => eq(variant.id, id),
      ...(withProduct && {
        with: {
          product: true,
        },
      }),
    });
  }
  async insertProductVariant({ variant }: { variant: ProductVariant }) {
    //@ts-ignore
    return await this.manager.insert(productVariants).values(variant);
  }
}
