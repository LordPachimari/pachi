import type {
  UpdateImagesOrderProps,
  UpdatePriceProps,
  UpdateProductVariantProps,
  UploadImagesProps,
} from "@pachi/api";
import type { Image, Product, ProductUpdates, Store } from "@pachi/db";

import { Separator } from "~/components/ui/separator";
import type { DebouncedFunc } from "~/types";
import Discountable from "./discountable";
import Inventory from "./inventory";
import Media from "./media";
import Pricing from "./pricing";
import ProductStatus from "./product-status";
import TitleAndDescription from "./title-description";

interface GeneralProps {
  product: Product;
  onInputChange: DebouncedFunc<
    ({ updates }: { updates: ProductUpdates }) => Promise<void>
  >;
  updateProduct: (props: { updates: ProductUpdates }) => Promise<void>;
  updatePrice: (props: UpdatePriceProps["args"]) => Promise<void>;
  updateVariant: (props: UpdateProductVariantProps["args"]) => Promise<void>;
  files: Image[];
  setFiles: React.Dispatch<React.SetStateAction<Image[]>>;
  uploadProductImages: (props: UploadImagesProps["args"]) => Promise<void>;
  updateProductImagesOrder: ({
    order,
    productId,
    variantId,
  }: UpdateImagesOrderProps["args"]) => Promise<void>;
  store: Store;
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
  console.log("images", product.variants![0]!.images);
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
        productCurrencies={
          (product.variants![0]!.prices ?? []).map(
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
