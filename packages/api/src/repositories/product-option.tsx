import { eq } from "drizzle-orm";

import type { ProductOption } from "@pachi/db";

import { RepositoryBase } from "./base";

export class ProductOptionRepository extends RepositoryBase {
  async getProductOption(id: string) {
    return (await this.manager.query.product_options.findFirst({
      where: (products) => eq(products.id, id),
      with: {
        values: true,
      },
    })) as ProductOption | undefined;
  }
}
