import type { ProductRepository } from "./product";
import type { ProductOptionRepository } from "./product-option";
import type { ProductTagRepository } from "./product-tag";
import type { ProductVariantRepository } from "./product-variant";
import type { StoreRepository } from "./store";
import type { UserRepository } from "./user";

export type Repositories = {
  productOptionRepository: ProductOptionRepository;
  productRepository: ProductRepository;
  productVariantRepository: ProductVariantRepository;
  userRepository: UserRepository;
  productTagRepository: ProductTagRepository;
  storeRepository: StoreRepository;
};
