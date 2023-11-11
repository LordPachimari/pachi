import { eq } from "drizzle-orm";

import { products, type Product } from "@pachi/db";

import { RepositoryBase } from "./base";

export class ProductRepository extends RepositoryBase {
  async getProductById(id: string) {
    return await this.manager.query.products.findFirst({
      where: (products) => eq(products.id, id),
    });
  }
  async insertProduct(product: Product) {
    //@ts-ignore
    return await this.manager.insert(products).values(product).execute();
  }
}
