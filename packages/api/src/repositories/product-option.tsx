import { eq } from "drizzle-orm";

import type { ProductOption } from "@pachi/db";

import { RepositoryBase } from "./base";

export class ProductOptionRepository extends RepositoryBase {
  async getProductOption({
    id,
    withValues,
  }: {
    id: string;
    withValues?: boolean;
  }) {
    return (await this.manager.query.productOptions.findFirst({
      where: (option) => eq(option.id, id),
      ...(withValues && {
        with: {
          values: true,
        },
      }),
    })) as ProductOption | undefined;
  }
}
