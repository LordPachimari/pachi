import type {
  CustomerGroup,
  Image,
  MoneyAmount,
  MoneyAmountUpdates,
  PriceList,
  PriceListUpdates,
  Product,
  ProductCollection,
  ProductCollectionUpdates,
  ProductOption,
  ProductOptionUpdates,
  ProductOptionValue,
  ProductOptionValueUpdates,
  ProductVariant,
  ProductVariantUpdates,
  Store,
  StoreUpdates,
  UpdateProduct,
} from "@pachi/db";

import type { MutationBase } from "./base";

export interface CreateProductProps extends MutationBase {
  args: {
    product: Product;
    default_variant_id: string;
  };
}

export interface DeleteProps extends MutationBase {
  args: { id: string; productId: string };
}

export interface UpdateProductProps extends MutationBase {
  args: UpdateProduct;
}

export interface UploadImagesProps extends MutationBase {
  args: { variant_id: string; images: Image[]; product_id: string };
}
export interface UpdateImagesOrderProps extends MutationBase {
  args: {
    product_id: string;
    variant_id: string;
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
    option_id: string;
    product_id: string;
    updates: ProductOptionUpdates;
  };
}

export interface CreateProductOptionValueProps extends MutationBase {
  args: { option_value: ProductOptionValue };
}

export interface UpdateProductOptionValueProps extends MutationBase {
  args: { id: string; updates: ProductOptionValueUpdates };
}
export interface UpdateProductOptionValuesProps extends MutationBase {
  args: {
    product_id: string;
    option_id: string;
    new_option_values: string[];
  };
}

export interface CreateProductVariantProps extends MutationBase {
  args: { variant: ProductVariant };
}

export interface UpdateProductVariantProps extends MutationBase {
  args: {
    variant_id: string;
    updates: ProductVariantUpdates;
    product_id: string;
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
  args: { customer_id: string; group_id: string };
}
export interface RemoveCustomerFromGroupProps extends MutationBase {
  args: { customer_id: string; group_id: string };
}
export interface CreatePriceListProps extends MutationBase {
  args: { price_list: PriceList };
}
export interface UpdatePriceListProps extends MutationBase {
  args: { id: string; updates: PriceListUpdates };
}
export interface AddProductToPriceListProps extends MutationBase {
  args: { price: MoneyAmount; price_list_id: string };
}
export interface RemoveProductFromPriceListProps extends MutationBase {
  args: { price_id: string; price_list_id: string };
}

export interface CreatePricesProps extends MutationBase {
  args: { prices: MoneyAmount[]; product_id: string; variant_id: string };
}
export interface UpdatePriceProps extends MutationBase {
  args: {
    money_amount_id: string;
    updates: MoneyAmountUpdates;
    variant_id: string;
    product_id: string;
  };
}
export interface CreateVariantProps extends MutationBase {
  args: { variant: ProductVariant };
}

export interface DeletePricesProps extends MutationBase {
  args: { ids: string[]; variant_id: string; product_id: string };
}
