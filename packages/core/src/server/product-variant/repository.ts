import { eq } from "drizzle-orm";

import type { ProductVariant } from "@pachi/db";
import { productVariants } from "@pachi/db/schema";

import { RepositoryBase } from "../base/repository";

export class ProductVariantRepository extends RepositoryBase {
  async getProductVariantById(id: string) {
    return await this.manager.query.productVariants.findFirst({
      where: (variant) => eq(variant.id, id),
      with: {
        product: true,
      },
    });
  }
  async insertProductVariant({ variant }: { variant: ProductVariant }) {
    //@ts-ignore
    return await this.manager.insert(productVariants).values(variant);
  }
}
