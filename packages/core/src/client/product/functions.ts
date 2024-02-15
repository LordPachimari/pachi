import type { WriteTransaction } from "replicache";

import { type Image, type Product, type ProductVariant } from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import {
  type AssignProductOptionValueToVariant,
  type CreateProduct,
  type CreateProductOption,
  type CreateProductPrices,
  type CreateProductVariant,
  type DeleteInput,
  type DeleteProductOption,
  type DeleteProductOptionValue,
  type DeleteProductPrices,
  type DeleteProductVariant,
  type UpdateProduct,
  type UpdateProductImagesOrder,
  type UpdateProductOption,
  type UpdateProductOptionValues,
  type UpdateProductPrice,
  type UpdateProductTags,
  type UpdateProductVariant,
  type UploadProductImages,
} from "../../input-schema/product";

function productNotFound(id: string) {
  console.info(`Product ${id} not found`);
  throw new Error(`Product ${id} not found`);
}
function variantNotFound(id: string) {
  console.info(`Variant ${id} not found`);
  throw new Error(`Variant ${id} not found`);
}
async function createProduct(tx: WriteTransaction, input: CreateProduct) {
  const { product, prices } = input;

  const defaultVariant: ProductVariant = {
    id: product.defaultVariantId,
    productId: product.id,
    prices,
  };

  await tx.set(product.id, {
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
    return productNotFound(id);
  }
  await tx.set(id, { ...product, ...updates });
}
async function updateProductImagesOrder(
  tx: WriteTransaction,
  input: UpdateProductImagesOrder,
) {
  const { order, productId, variantId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    return productNotFound(productId);
  }
  const variant = product.variants?.find((val) => val.id === variantId);
  if (!variant) {
    return variantNotFound(variantId);
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
  await tx.set(productId, {
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
    return productNotFound(productId);
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
  await tx.set(productId, newProduct);
}

async function createProductOption(
  tx: WriteTransaction,
  input: CreateProductOption,
) {
  const { option } = input;
  const product = (await tx.get(option.productId)) as Product | undefined;
  if (!product) {
    return productNotFound(option.productId);
  }
  const product_options = product.options ? product.options : [];
  await tx.set(product.id, {
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
    return productNotFound(productId);
  }
  await tx.set(product.id, {
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
    return productNotFound(productId);
  }
  const product_options = product.options
    ? product.options.filter((option) => option.id !== optionId)
    : [];
  await tx.set(product.id, {
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
    return productNotFound(productId);
  }

  await tx.set(product.id, {
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
    return productNotFound(productId);
  }
  await tx.set(product.id, {
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
    return productNotFound(variant.productId);
  }
  const variants = product.variants ? [...product.variants] : [];
  variants.push(variant);
  await tx.set(product.id, {
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
    return productNotFound(productId);
  }
  if (!product.variants) {
    return variantNotFound("");
  }
  const variants = product.variants.map((variant) => {
    if (variant.id === variantId) {
      return { ...variant, ...updates };
    }
    return variant;
  });
  await tx.set(product.id, { ...product, variants });
}

async function deleteProductVariant(
  tx: WriteTransaction,
  input: DeleteProductVariant,
) {
  const { variantId, productId } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    return productNotFound(productId);
  }
  const variants = product.variants
    ? product.variants.filter((variant) => variant.id !== variantId)
    : [];
  await tx.set(product.id, {
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
    return productNotFound(productId);
  }
  const variant = product.variants?.find((variant) => variant.id === variantId);
  if (!variant) {
    return variantNotFound(variantId);
  }
  const variantPrices = variant.prices ? [...variant.prices] : [];
  for (const price of prices) {
    variantPrices.push(price);
  }
  await tx.set(product.id, {
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

  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    return productNotFound(productId);
  }
  const variant = product.variants?.find((val) => val.id === variantId);
  if (!variant) {
    return variantNotFound(variantId);
  }
  const variantPrices = variant.prices
    ? variant.prices.map((price) => {
        if (price.id === priceId) return { ...price, ...updates };
        return price;
      })
    : [];

  await tx.set(product.id, {
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
    return productNotFound(productId);
  }
  const variant = product.variants?.find((val) => val.id === variantId);
  if (!variant) {
    return variantNotFound(variantId);
  }
  const variant_prices = variant.prices
    ? variant.prices.filter((price) => !priceIds.includes(price.id))
    : [];
  await tx.set(product.id, {
    ...product,
    variants: product.variants?.map((variant_) =>
      variant_.id === variantId
        ? { ...variant, prices: variant_prices }
        : variant_,
    ),
  });
}

async function assignProductOptionValueToVariant(
  tx: WriteTransaction,
  input: AssignProductOptionValueToVariant,
) {
  const { optionValueId, variantId, prevOptionValueId, productId } = input;
  const product = (await tx.get<Product>(productId)) as Product | undefined;
  if (!product) {
    return productNotFound(productId);
  }
  const variant = product.variants?.find((val) => val.id === variantId);
  if (!variant) {
    return variantNotFound(variantId);
  }
  const productOptionValue = product.options
    ?.find((option) => option.values?.some((val) => val.id === optionValueId))
    ?.values?.find((val) => val.id === optionValueId);
  let optionValues = variant.optionValues ? [...variant.optionValues] : [];
  if (prevOptionValueId)
    optionValues = optionValues.filter(
      (val) => val.optionValue.id !== prevOptionValueId,
    );

  await tx.set(product.id, {
    ...product,
    variants: product.variants?.map((variant_) =>
      variant_.id === variantId
        ? {
            ...variant,
            optionValues: [
              ...optionValues,
              { optionValue: productOptionValue! },
            ],
          }
        : variant_,
    ),
  });
}

async function updateProductTags(
  tx: WriteTransaction,
  input: UpdateProductTags,
) {
  const { productId, tags } = input;
  const product = (await tx.get(productId)) as Product | undefined;
  if (!product) {
    return productNotFound(productId);
  }

  const newTags = tags.map((value) => {
    return {
      id: generateId({ id: ulid(), prefix: "p_tag" }),
      value,
      createdAt: new Date().toISOString(),
    };
  });
  await tx.set(productId, {
    ...product,
    tags: newTags,
  });
}

export {
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
  updateProductTags,
};
