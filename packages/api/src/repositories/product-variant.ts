import { eq } from "drizzle-orm";

import { RepositoryBase } from "./base";

export class ProductVariantRepository extends RepositoryBase {
  async getProductVariantById({id, withProduct}:{id: string, withProduct?:boolean}) {
    return await this.manager.query.productVariants.findFirst({
      where: (variant) => eq(variant.id, id),
      ...(withProduct && {
        with:{
          product:true
        }
      })
    });
  }
}
