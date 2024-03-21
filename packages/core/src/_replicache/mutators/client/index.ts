import type { WriteTransaction } from "replicache";

;
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
import type { Server } from "..";

export type DashboardMutatorsType = {
  [key in keyof Server.DashboardMutatorsType]: (
    tx: WriteTransaction,
    args: Parameters<Server.DashboardMutatorsType[key]>[0],
  ) => Promise<void>;
};
export const DashboardMutators: DashboardMutatorsType = {
  createProduct,
  updateProduct,
  deleteProduct,
  createProductOption,
  updateProductOption,
  deleteProductOption,
  assignProductOptionValueToVariant,
  createProductPrices,
  deleteProductPrices,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  deleteProductOptionValue,
  updateProductImagesOrder,
  updateProductOptionValues,
  updateProductPrice,
  uploadProductImages,
};
export type GlobalMutatorsType = {
  [key in keyof Server.GlobalMutatorsType]: (
    ctx: WriteTransaction,
    args: Parameters<Server.GlobalMutatorsType[key]>[0],
  ) => Promise<void>;
};
export const GlobalMutators: GlobalMutatorsType = {
  createStore,
  updateStore,
  createUser,
};
