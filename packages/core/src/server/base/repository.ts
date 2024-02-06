import {
  ProductOptionRepository,
  type ProductOptionRepositoryType,
} from "../product-option/repository";
import {
  ProductTagRepository,
  type ProductTagRepositoryType,
} from "../product-tag/repository";
import {
  ProductVariantRepository,
  type ProductVariantRepositoryType,
} from "../product-variant/repository";
import {
  ProductRepository,
  type ProductRepositoryType,
} from "../product/repository";
import { StoreRepository, type StoreRepositoryType } from "../store/repository";
import { UserRepository, type UserRepositoryType } from "../user/repository";

export type RepositoriesType = {
  productOptionRepository: ProductOptionRepositoryType;
  productRepository: ProductRepositoryType;
  productVariantRepository: ProductVariantRepositoryType;
  userRepository: UserRepositoryType;
  productTagRepository: ProductTagRepositoryType;
  storeRepository: StoreRepositoryType;
};

export const Repositories: RepositoriesType = {
  productOptionRepository: ProductOptionRepository,
  productRepository: ProductRepository,
  productVariantRepository: ProductVariantRepository,
  userRepository: UserRepository,
  productTagRepository: ProductTagRepository,
  storeRepository: StoreRepository,
};
