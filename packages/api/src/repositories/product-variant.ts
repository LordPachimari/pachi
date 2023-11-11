import { eq } from "drizzle-orm";

import { RepositoryBase } from "./base";

export class ProductVariantRepository extends RepositoryBase {
  async getProductVariantById(id: string) {
    return await this.manager.query.product_variants.findFirst({
      where: (product_variant) => eq(product_variant.id, id),
    });
  }
}
