import type { Transaction } from "@pachi/db";
import type { RequestHeaders } from "@pachi/types";

import { server, ServerMutations, type ReplicacheTransaction } from "..";

export interface ServerProps {
  transaction: Transaction;
  userId?: string | undefined;
  requestHeaders?: RequestHeaders | undefined;
  services: server.Services;
  repositories: server.Repositories;
  replicacheTransaction: ReplicacheTransaction;
}

export function initDashboardMutations(props: ServerProps) {
  const newServer = new ServerMutations()
    .expose("createProduct", server.Product.createProduct(props))
    .expose("deleteProduct", server.Product.deleteProduct(props))
    .expose("updateProduct", server.Product.updateProduct(props))
    .expose("updateImagesOrder", server.Product.updateImagesOrder(props))
    .expose("uploadProductImages", server.Product.uploadProductImages(props))
    .expose("createProductOption", server.Product.createProductOption(props))
    .expose("updateProductOption", server.Product.updateProductOption(props))
    .expose("deleteProductOption", server.Product.deleteProductOption(props))
    .expose(
      "updateProductOptionValues",
      server.Product.updateProductOptionValues(props),
    )
    .expose(
      "deleteProductOptionValue",
      server.Product.deleteProductOptionValue(props),
    )
    .expose("createProductVariant", server.Product.createProductVariant(props))
    .expose("updateProductVariant", server.Product.updateProductVariant(props))
    .expose("deleteProductVariant", server.Product.deleteProductVariant(props))
    .expose("createProductPrices", server.Product.createProductPrices(props))
    .expose("updateProductPrice", server.Product.updateProductPrice(props))
    .expose("deleteProductPrices", server.Product.deleteProductPrices(props));

  return newServer;
}
export type DashboardMutationsType = ReturnType<typeof initDashboardMutations>;

export function initGlobalMutations(props: ServerProps) {
  const newServer = new ServerMutations()
    .expose("createUser", server.User.createUser(props))
    .expose("createStore", server.Store.createStore(props))
    .expose("updateStore", server.Store.updateStore(props));

  return newServer;
}
