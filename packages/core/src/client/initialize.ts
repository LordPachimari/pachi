import { client } from "..";
import { Client } from "../replicache";
import type { DashboardServerType } from "../server/initialize";

export interface ClientProps {
  services: client.Services;
}

export function initDashboardClient(props: ClientProps) {
  return new Client<DashboardServerType>()
    .expose("createProduct", client.Product.createProduct)
    .expose("deleteProduct", client.Product.deleteProduct)
    .expose("updateProduct", client.Product.updateProduct)
    .expose("updateImagesOrder", client.Product.updateImagesOrder)
    .expose("uploadProductImages", client.Product.uploadProductImages)
    .expose("createProductOption", client.Product.createProductOption)
    .expose("updateProductOption", client.Product.updateProductOption)
    .expose("deleteProductOption", client.Product.deleteProductOption)
    .expose(
      "updateProductOptionValues",
      client.Product.updateProductOptionValues,
    )
    .expose("deleteProductOptionValue", client.Product.deleteProductOptionValue)
    .expose("createProductVariant", client.Product.createProductVariant)
    .expose("updateProductVariant", client.Product.updateProductVariant)
    .expose("deleteProductVariant", client.Product.deleteProductVariant)
    .expose("createProductPrices", client.Product.createProductPrices)
    .expose("updateProductPrice", client.Product.updateProductPrice)
    .expose("deleteProductPrices", client.Product.deleteProductPrices);
}
