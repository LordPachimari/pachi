import type { Db, Transaction } from "@pachi/db";

import type { ProductOptionRepository } from "../product-option/repository";
import type { ProductTagRepository } from "../product-tag/repository";
import type { ProductVariantRepository } from "../product-variant/repository";
import type { ProductRepository } from "../product/repository";
import type { StoreRepository } from "../store/repository";
import type { UserRepository } from "../user/repository";

export class RepositoryBase {
  protected readonly manager: Transaction | Db;
  constructor(manager: Transaction | Db) {
    this.manager = manager;
  }
}

export type Repositories = {
  productOptionRepository: ProductOptionRepository;
  productRepository: ProductRepository;
  productVariantRepository: ProductVariantRepository;
  userRepository: UserRepository;
  productTagRepository: ProductTagRepository;
  storeRepository: StoreRepository;
};
