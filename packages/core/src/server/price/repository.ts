import { eq } from "drizzle-orm";

import { type Price } from "@pachi/db";
import { prices } from "@pachi/db/schema";

import { RepositoryBase } from "../base/repository";

export class PriceRepository extends RepositoryBase {
  async getPrice({ id }: { id: string }) {
    return (await this.manager.query.prices.findFirst({
      where: (prices) => eq(prices.id, id),
    })) as Price | undefined;
  }
  async insertPrice({ price }: { price: Price }) {
    //@ts-ignore
    return await this.manager.insert(prices).values(price);
  }
}
