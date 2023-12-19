import { eq } from "drizzle-orm";

import { type Product } from "@pachi/db";
import { products } from "@pachi/db/schema";

import { RepositoryBase } from "./base";

export class ProductRepository extends RepositoryBase {
  async getProductById({ id }: { id: string }) {
    return await this.manager.query.products.findFirst({
      where: (products) => eq(products.id, id),
    });
  }
  async insertProduct({ product }: { product: Product }) {
    //@ts-ignore
    return await this.manager.insert(products).values(product);
  }
}
