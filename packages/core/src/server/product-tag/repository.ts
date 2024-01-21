import { eq } from "drizzle-orm";

import { type ProductOption, type ProductTag } from "@pachi/db";
import { productsToTags, productTags } from "@pachi/db/schema";

import { RepositoryBase } from "../base/repository";

export class ProductTagRepository extends RepositoryBase {
  async getProductTag({
    id,
    withProducts,
  }: {
    id: string;
    withProducts?: boolean;
  }) {
    return (await this.manager.query.productTags.findFirst({
      where: (tag) => eq(tag.id, id),
      ...(withProducts && {
        with: {
          products: true,
        },
      }),
    }))
  }

  async createProductTag({ tag }: { tag: ProductTag }) {
    //@ts-ignore
    return await this.manager.insert(productTags).values(tag).returning();
  }
  async createProductTags({ tags }: { tags: ProductTag[] }) {
    //@ts-ignore
    return await this.manager.insert(productTags).values(tags).returning();
  }
  async assignTagToProduct({
    tagId,
    productId,
  }: {
    tagId: string;
    productId: string;
  }) {
    return await this.manager.insert(productsToTags).values({
      productId,
      tagId,
    });
  }
  async checkProductTagExists({ value }: { value: string }) {
    const productTag = await this.manager.query.productTags.findFirst({
      where: (tag) => eq(tag.value, value),
      columns: {
        id: true,
      },
    });
    return productTag;
  }
  async checkProductTagAssigned({
    productId,
    tagId,
  }: {
    productId: string;
    tagId: string;
  }) {
    const result = await this.manager.query.productsToTags.findFirst({
      where: (tag, { eq, and }) =>
        and(eq(tag.productId, productId), eq(tag.tagId, tagId)),
    });
    return result;
  }
}
