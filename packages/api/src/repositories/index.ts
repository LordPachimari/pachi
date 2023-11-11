import type { ProductRepository } from "./product";
import type { ProductOptionRepository } from "./product-option";
import type { ProductVariantRepository } from "./product-variant";

export type Repositories = {
  product_option_repository: ProductOptionRepository;
  product_repository: ProductRepository;
  product_variant_repository: ProductVariantRepository;
};
