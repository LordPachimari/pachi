import {
  type Client,
  type Image,
  type UpdateProduct,
  type UpdateProductImagesOrder,
  type UpdateProductPrice,
  type UpdateProductVariant,
  type UploadProductImages,
} from "@pachi/validators";

import { Separator } from "~/components/ui/separator";
import type { DebouncedFunc } from "~/types";
import Discountable from "./discountable";
import Inventory from "./inventory";
import Media from "./media";
import Pricing from "./pricing";
import ProductStatus from "./product-status";
import TitleAndDescription from "./title-description";

interface GeneralProps {
  product: Client.Product;
  onInputChange: DebouncedFunc<
    (props: UpdateProduct["updates"]) => Promise<void>
  >;
  updateProduct: (props: UpdateProduct["updates"]) => Promise<void>;
  updatePrice: (props: UpdateProductPrice) => Promise<void>;
  updateVariant: (props: UpdateProductVariant) => Promise<void>;
  files: Image[];
  setFiles: React.Dispatch<React.SetStateAction<Image[]>>;
  uploadProductImages: (props: UploadProductImages) => Promise<void>;
  updateProductImagesOrder: ({
    order,
    productId,
    variantId,
  }: UpdateProductImagesOrder) => Promise<void>;
  store: Client.Store;
}

export function General({
  product,
  onInputChange,
  updateProduct,
  updatePrice,
  updateVariant,
  uploadProductImages,
  store,

  files,
  setFiles,
  updateProductImagesOrder,
}: GeneralProps) {
  return (
    <div className="px-4 pb-2 pt-0">
      <ProductStatus status={product.status} updateProduct={updateProduct} />
      <Separator className="my-4" />
      <TitleAndDescription
        description={product.description}
        title={product.title}
        onInputChange={onInputChange}
      />
      <Discountable
        updateProduct={updateProduct}
        discountable={product.discountable}
      />
      <Separator className="mb-4 mt-2" />
      <Media
        productId={product.id}
        images={product.variants![0]!.images}
        files={files}
        setFiles={setFiles}
        variantId={product.variants![0]!.id}
        uploadProductImages={uploadProductImages}
        updateProductImagesOrder={updateProductImagesOrder}
      />
      <Separator className="my-4" />
      <Pricing
        updatePrice={updatePrice}
        variant={product.variants![0]!}
        productCurrencyCodes={
          (product.variants?.[0]?.prices ?? []).map(
            (price) => price.currencyCode,
          ) ?? []
        }
        storeId={store.id}
        productId={product.id}
      />
      <Separator className="my-4" />
      <Inventory
        updateVariant={updateVariant}
        variant={product.variants![0]!}
      />
    </div>
  );
}
