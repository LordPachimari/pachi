import type { WriteTransaction } from "replicache";

import { ClientProduct, ClientStore, ClientUser } from "../../client";
import type {
  ServerDashboardMutatorsType,
  ServerGlobalMutatorsType,
} from "./server";

export type ClientDashboardMutatorsType = {
  [key in keyof ServerDashboardMutatorsType]: (
    tx: WriteTransaction,
    args: Parameters<ServerDashboardMutatorsType[key]>[0],
  ) => Promise<void>;
};
export const ClientDashboardMutators: ClientDashboardMutatorsType = {
  createProduct: ClientProduct.createProduct,
  updateProduct: ClientProduct.updateProduct,
  deleteProduct: ClientProduct.deleteProduct,
  createProductOption: ClientProduct.createProductOption,
  updateProductOption: ClientProduct.updateProductOption,
  deleteProductOption: ClientProduct.deleteProductOption,
  assignProductOptionValueToVariant:
    ClientProduct.assignProductOptionValueToVariant,
  createProductPrices: ClientProduct.createProductPrices,
  deleteProductPrices: ClientProduct.deleteProductPrices,
  createProductVariant: ClientProduct.createProductVariant,
  updateProductVariant: ClientProduct.updateProductVariant,
  deleteProductVariant: ClientProduct.deleteProductVariant,
  deleteProductOptionValue: ClientProduct.deleteProductOptionValue,
  updateProductImagesOrder: ClientProduct.updateProductImagesOrder,
  updateProductOptionValues: ClientProduct.updateProductOptionValues,
  updateProductPrice: ClientProduct.updateProductPrice,
  updateProductTags: ClientProduct.updateProductTags,
  uploadProductImages: ClientProduct.uploadProductImages,
};

export type ClientGlobalMutatorsType = {
  [key in keyof ServerGlobalMutatorsType]: (
    ctx: WriteTransaction,
    args: Parameters<ServerGlobalMutatorsType[key]>[0],
  ) => Promise<void>;
};

export const ClientGlobalMutators: ClientGlobalMutatorsType = {
  createStore: ClientStore.createStore,
  updateStore: ClientStore.updateStore,
  createUser: ClientUser.createUser,
};
