import { eq } from "drizzle-orm";

import type { ProductOption } from "@pachi/db";

import { RepositoryBase } from "../base/repository";

export class ProductOptionRepository extends RepositoryBase {
  async getProductOption(id: string) {
    return await this.manager.query.productOptions.findFirst({
      where: (option) => eq(option.id, id),
      with: {
        values: true,
      },
    });
  }
}
