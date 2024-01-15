import type { WriteTransaction } from "replicache";

import {
  type Image,
  type Product,
  type ProductVariant,
  type Store,
} from "@pachi/db";

import {
  type CreateProduct,
  type CreateProductOption,
  type CreateProductPrices,
  type CreateProductVariant,
  type DeleteInput,
  type DeleteProductOption,
  type DeleteProductOptionValue,
  type DeleteProductPrices,
  type DeleteProductVariant,
  type UpdateImagesOrder,
  type UpdateProduct,
  type UpdateProductOption,
  type UpdateProductOptionValues,
  type UpdateProductPrice,
  type UpdateProductVariant,
  type UploadProductImages,
} from "../../common/schema/product";

async function createProduct(tx: WriteTransaction, input: CreateProduct) {
  const { product, defaultVariantId, storeId, prices } = input;

  const store = (await tx.get(storeId)) as Store | undefined;
  if (!store) {
    console.info(`Store ${storeId} not found`);
    throw new Error("store not found");
  }

  const defaultVariant: ProductVariant = {
    id: defaultVariantId,
    productId: product.id,
    prices,
  };

  await tx.put(product.id, {
    ...product,
    defaultVariantId: defaultVariant.id,
    variants: [defaultVariant],
  });
}
async function deleteProduct(tx: WriteTransaction, input: DeleteInput) {
  const { id } = input;
  await tx.del(id);
}
async function updateProduct(tx: WriteTransaction, input: UpdateProduct) {
  const { updates, id } = input;
  const product = (await tx.get(id)) as Product | undefined;
  if (!product) {
    console.info(`Product ${id} not found`);
    throw new Error(`Product ${id} not found`);
  }
  await tx.put(id, { ...product, ...updates });
}
async function updateImagesOrder(
  tx: WriteTransaction,
  input: UpdateImagesOrder,
) {
  const { order, productId, variantId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.info(`Product ${productId} not found`);
    throw new Error(`Product ${productId} not found`);
  }
  const variant = product.variants?.find((val) => val.id === variantId);
  if (!variant) {
    console.log("variant not found");
    throw new Error("variant not found");
  }
  const images = variant.images ? structuredClone(variant.images) : [];
  if (images.length === 0) {
    return;
  }
  for (const image of images) {
    if (order[image.id] !== undefined) image.order = order[image.id]!;
  }
  let thumbnail: Image | undefined = undefined;
  if (variant.id.startsWith("default")) {
    for (const image of images) {
      if (image.order === 0) {
        thumbnail = image;
      }
    }
  }
  await tx.put(productId, {
    ...product,
    ...(thumbnail &&
      product.thumbnail &&
      product.thumbnail.id !== thumbnail.id && { thumbnail }),
    variant: product.variants?.map((variant) => {
      if (variant.id === variantId) {
        return { ...variant, images };
      }
      return variant;
    }),
  });
}
async function uploadProductImages(
  tx: WriteTransaction,
  input: UploadProductImages,
) {
  const { variantId, images, productId } = input;
  if (images.length === 0) {
    return;
  }
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    throw new Error("Product not found");
  }
  const newProduct = {
    ...product,
    variants: product.variants?.map((variant) => {
      if (variant.id === variantId) {
        return {
          ...variant,
          images: [...(variant.images ? variant.images : []), ...images],
        };
      }
      return variant;
    }),
  };
  await tx.put(productId, newProduct);
}

async function createProductOption(
  tx: WriteTransaction,
  input: CreateProductOption,
) {
  const { option } = input;
  const product = (await tx.get(option.productId)) as Product | undefined;
  if (!product) {
    console.error(`Product ${option.productId} not found`);
    throw new Error(`Product ${option.productId} not found`);
  }
  const product_options = product.options ? product.options : [];
  await tx.put(product.id, {
    ...product,
    options: [...product_options, option],
  });
}

async function updateProductOption(
  tx: WriteTransaction,
  input: UpdateProductOption,
) {
  const { optionId, productId, updates } = input;

  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.error(`Product ${productId} not found`);
    throw new Error(`Product ${productId} not found`);
  }
  await tx.put(product.id, {
    ...product,
    options: product.options?.map((option) =>
      option.id === optionId ? { ...option, ...updates } : option,
    ),
  });
}

async function deleteProductOption(
  tx: WriteTransaction,
  input: DeleteProductOption,
) {
  const { optionId, productId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.info(`Product ${productId} not found`);
    return;
  }
  const product_options = product.options
    ? product.options.filter((option) => option.id !== optionId)
    : [];
  await tx.put(product.id, {
    ...product,
    options: product_options,
  });
}

async function updateProductOptionValues(
  tx: WriteTransaction,
  input: UpdateProductOptionValues,
) {
  const { optionId, productId, newOptionValues } = input;

  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.info(`Product ${productId} not found`);
    throw new Error(`Product ${productId} not found`);
  }

  await tx.put(product.id, {
    ...product,
    options: product.options?.map((option) =>
      option.id === optionId ? { ...option, values: newOptionValues } : option,
    ),
  });
}

async function deleteProductOptionValue(
  tx: WriteTransaction,
  input: DeleteProductOptionValue,
) {
  const { optionValueId, productId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.info(`Product ${productId} not found`);
    throw new Error(`Product ${productId} not found`);
  }
  await tx.put(product.id, {
    ...product,
    options: product.options?.map((option) =>
      option.id === optionValueId
        ? {
            ...option,
            values: option.values?.filter(
              (value) => value.id !== optionValueId,
            ),
          }
        : option,
    ),
  });
}

async function createProductVariant(
  tx: WriteTransaction,
  input: CreateProductVariant,
) {
  const { variant } = input;
  const product = (await tx.get(variant.productId)) as Product | undefined;
  if (!product) {
    console.info(`Product  not found`);
    throw new Error(`Product not found`);
  }
  const variants = product.variants ? [...product.variants] : [];
  variants.push(variant);
  await tx.put(product.id, {
    ...product,
    variants,
  });
}

async function updateProductVariant(
  tx: WriteTransaction,
  input: UpdateProductVariant,
) {
  const { variantId, updates, productId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    throw new Error("Product not found");
  }
  if (!product.variants) {
    console.info(`Product  not found`);

    throw new Error("Product variants not found");
  }
  const variants = product.variants.map((variant) => {
    if (variant.id === variantId) {
      return { ...variant, ...updates };
    }
    return variant;
  });
  await tx.put(product.id, { ...product, variants });
}

async function deleteProductVariant(
  tx: WriteTransaction,
  input: DeleteProductVariant,
) {
  const { variantId, productId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.info(`Product  not found`);
    throw new Error(`Product not found`);
  }
  const variants = product.variants
    ? product.variants.filter((variant) => variant.id !== variantId)
    : [];
  await tx.put(product.id, {
    ...product,
    variants,
  });
}

async function createProductPrices(
  tx: WriteTransaction,
  input: CreateProductPrices,
) {
  const { prices, productId, variantId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    throw new Error("Product not found");
  }
  const variant = product.variants?.find((variant) => variant.id === variantId);
  if (!variant) {
    throw new Error("Variant not found");
  }
  const variantPrices = variant.prices ? [...variant.prices] : [];
  for (const price of prices) {
    variantPrices.push(price);
  }
  await tx.put(product.id, {
    ...product,
    variants: product.variants?.map((variant) =>
      variant.id === variantId
        ? { ...variant, prices: [...variantPrices] }
        : variant,
    ),
  });
}

async function updateProductPrice(
  tx: WriteTransaction,
  input: UpdateProductPrice,
) {
  const { priceId, updates, variantId, productId } = input;

  console.log("productId", productId);

  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.info(`Product  not found`);
    return;
  }
  const variant = product.variants?.find((val) => val.id === variantId);
  if (!variant) {
    console.log("variant not found");
    return;
  }
  const variantPrices = variant.prices
    ? variant.prices.map((price) => {
        if (price.id === priceId) return { ...price, ...updates };
        return price;
      })
    : [];

  await tx.put(product.id, {
    ...product,
    variants: product.variants?.map((variant_) =>
      variant_.id === variantId
        ? { ...variant, prices: variantPrices }
        : variant_,
    ),
  });
}

async function deleteProductPrices(
  tx: WriteTransaction,
  input: DeleteProductPrices,
) {
  const { priceIds, productId, variantId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    console.info(`Product  not found`);
    throw new Error(`Product not found`);
  }
  const variant = product.variants?.find((val) => val.id === variantId);
  if (!variant) {
    console.log("variant not found");
    throw new Error("variant not found");
  }
  const variant_prices = variant.prices
    ? variant.prices.filter((price) => !priceIds.includes(price.id))
    : [];
  await tx.put(product.id, {
    ...product,
    variants: product.variants?.map((variant_) =>
      variant_.id === variantId
        ? { ...variant, prices: variant_prices }
        : variant_,
    ),
  });
}
export {
  createProduct,
  deleteProduct,
  updateProduct,
  updateImagesOrder,
  uploadProductImages,
  createProductOption,
  updateProductOption,
  deleteProductOption,
  updateProductOptionValues,
  deleteProductOptionValue,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  createProductPrices,
  updateProductPrice,
  deleteProductPrices,
};
