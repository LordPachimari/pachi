import type {
  CustomerGroup,
  Image,
  Price,
  PriceList,
  PriceListUpdates,
  PriceUpdates,
  Product,
  ProductCollection,
  ProductCollectionUpdates,
  ProductOption,
  ProductOptionUpdates,
  ProductOptionValue,
  ProductOptionValueUpdates,
  ProductVariant,
  ProductVariantUpdates,
  UpdateProduct,
} from "@pachi/db";
import type { Money } from "@pachi/utils";

import type { MutationBase } from "./base";

export interface CreateProductProps extends MutationBase {
  args: {
    product: Product;
    defaultVariantId: string;
    storeId: string;
    prices: Price[];
  };
}

export interface DeleteProps extends MutationBase {
  args: { id: string; productId: string };
}

export interface UpdateProductProps extends MutationBase {
  args: UpdateProduct;
}

export interface UploadImagesProps extends MutationBase {
  args: { variantId: string; images: Image[]; productId: string };
}
export interface UpdateImagesOrderProps extends MutationBase {
  args: {
    productId: string;
    variantId: string;
    order: Record<string, number>;
  };
}

export interface CreateProductOptionProps extends MutationBase {
  args: {
    option: ProductOption;
  };
}
export interface UpdateProductOptionProps extends MutationBase {
  args: {
    optionId: string;
    productId: string;
    updates: ProductOptionUpdates;
  };
}

export interface CreateProductOptionValueProps extends MutationBase {
  args: { optionValue: ProductOptionValue };
}

export interface UpdateProductOptionValueProps extends MutationBase {
  args: { id: string; updates: ProductOptionValueUpdates };
}
export interface UpdateProductOptionValuesProps extends MutationBase {
  args: {
    productId: string;
    optionId: string;
    newOptionValues: ProductOptionValue[];
  };
}
export interface UpdateProductTagsProps extends MutationBase {
  args: {
    productId: string;
    tags: string[];
  };
}

export interface CreateProductVariantProps extends MutationBase {
  args: { variant: ProductVariant };
}

export interface UpdateProductVariantProps extends MutationBase {
  args: {
    variantId: string;
    updates: ProductVariantUpdates;
    productId: string;
  };
}
export interface CreateProductCollectionProps extends MutationBase {
  args: { collection: ProductCollection };
}
export interface UpdateProductCollectionProps extends MutationBase {
  args: { id: string; updates: ProductCollectionUpdates };
}
export interface CreateCustomerGroupProps extends MutationBase {
  args: { group: CustomerGroup };
}
export interface UpdateCustomerGroupProps extends MutationBase {
  args: { id: string; updates: CustomerGroup };
}
export interface AddCustomerToGroupProps extends MutationBase {
  args: { customerId: string; groupId: string };
}
export interface RemoveCustomerFromGroupProps extends MutationBase {
  args: { customerId: string; groupId: string };
}
export interface CreatePriceListProps extends MutationBase {
  args: { priceList: PriceList };
}
export interface UpdatePriceListProps extends MutationBase {
  args: { id: string; updates: PriceListUpdates };
}
export interface AddProductToPriceListProps extends MutationBase {
  args: { price: Price; priceListId: string };
}
export interface RemoveProductFromPriceListProps extends MutationBase {
  args: { priceId: string; priceListId: string };
}

export interface CreatePricesProps extends MutationBase {
  args: { prices: Price[]; productId: string; variantId: string };
}
export interface UpdatePriceProps extends MutationBase {
  args: {
    priceId: string;
    updates: PriceUpdates;
    variantId: string;
    productId: string;
  };
}
export interface CreateVariantProps extends MutationBase {
  args: { variant: ProductVariant };
}

export interface DeletePricesProps extends MutationBase {
  args: { ids: string[]; variantId: string; productId: string };
}

export interface AssignProductOptionValueToVariantProps extends MutationBase {
  args: {
    variantId: string;
    optionValueId: string;
    prevOptionValueId?: string;
    productId: string;
    optionId: string;
  };
}
