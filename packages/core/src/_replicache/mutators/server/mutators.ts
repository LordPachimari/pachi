import {
  assignProductOptionValueToVariant,
  createProduct,
  createProductOption,
  createProductPrices,
  createProductVariant,
  deleteProduct,
  deleteProductOption,
  deleteProductOptionValue,
  deleteProductPrices,
  deleteProductVariant,
  updateProduct,
  updateProductImagesOrder,
  updateProductOption,
  updateProductOptionValues,
  updateProductPrice,
  updateProductVariant,
  uploadProductImages,
} from "./product";
import { createStore, updateStore } from "./store";
import { createUser } from "./user";

const DashboardMutators = {
  createProduct,
  assignProductOptionValueToVariant,
  createProductOption,
  createProductPrices,
  createProductVariant,
  deleteProduct,
  deleteProductOption,
  deleteProductOptionValue,
  deleteProductPrices,
  deleteProductVariant,
  updateProduct,
  updateProductImagesOrder,
  updateProductOption,
  updateProductOptionValues,
  updateProductPrice,
  updateProductVariant,
  uploadProductImages,
};

export const DashboardMutatorsMap = new Map(
  Object.entries(DashboardMutators),
);
export type DashboardMutatorsType = typeof DashboardMutators;
export type DashboardMutatorsMapType = typeof DashboardMutatorsMap;
export const GlobalMutators = {
  createUser,
  createStore,
  updateStore,
};
export const GlobalMutatorsMap = new Map(
  Object.entries(GlobalMutators),
);
export type GlobalMutatorsType = typeof GlobalMutators;
export type GlobalMutatorsMapType = typeof GlobalMutatorsMap;
