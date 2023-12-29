import { eq } from "drizzle-orm";

import { RepositoryBase } from "./base";

export class StoreRepository extends RepositoryBase {
  async getStoreById({ id }: { id: string }) {
    return await this.manager.query.stores.findFirst({
      where: (stores) => eq(stores.id, id),
    });
  }
}
