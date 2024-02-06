import { Product, Store, User } from "../../server";

const ServerDashboardMutators = {
  createProduct: Product.createProduct,
  assignProductOptionValueToVariant: Product.assignProductOptionValueToVariant,
  createProductOption: Product.createProductOption,
  createProductPrices: Product.createProductPrices,
  createProductVariant: Product.createProductVariant,
  deleteProduct: Product.deleteProduct,
  deleteProductOption: Product.deleteProductOption,
  deleteProductOptionValue: Product.deleteProductOptionValue,
  deleteProductPrices: Product.deleteProductPrices,
  deleteProductVariant: Product.deleteProductVariant,
  updateProduct: Product.updateProduct,
  updateProductImagesOrder: Product.updateProductImagesOrder,
  updateProductOption: Product.updateProductOption,
  updateProductOptionValues: Product.updateProductOptionValues,
  updateProductPrice: Product.updateProductPrice,
  updateProductTags: Product.updateProductTags,
  updateProductVariant: Product.updateProductVariant,
  uploadProductImages: Product.uploadProductImages,
};

export const ServerDashboardMutatorsMap = new Map(
  Object.entries(ServerDashboardMutators),
);
export type ServerDashboardMutatorsType = typeof ServerDashboardMutators;
export type ServerDashboardMutatorsMapType = typeof ServerDashboardMutatorsMap;

export const ServerGlobalMutators = {
  createUser: User.createUser,
  createStore: Store.createStore,
  updateStore: Store.updateStore,
};
export const ServerGlobalMutatorsMap = new Map(
  Object.entries(ServerGlobalMutators),
);
export type ServerGlobalMutatorsType = typeof ServerGlobalMutators;
export type ServerGlobalMutatorsMapType = typeof ServerGlobalMutatorsMap;
