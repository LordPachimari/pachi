import { type ProductVariant } from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import {
  AssignProductOptionValueToVariantSchema,
  CreateProductOptionSchema,
  CreateProductPricesSchema,
  CreateProductSchema,
  CreateProductVariantSchema,
  DeleteInputSchema,
  DeleteProductOptionSchema,
  DeleteProductOptionValueSchema,
  DeleteProductPricesSchema,
  DeleteProductVariantSchema,
  UpdateProductImagesOrderSchema,
  UpdateProductOptionSchema,
  UpdateProductOptionValuesSchema,
  UpdateProductPriceSchema,
  UpdateProductSchema,
  UpdateProductTagsSchema,
  UpdateProductVariantSchema,
  UploadProductImagesSchema,
} from "../../input-schema/product";
import { zod } from "../../util/zod";
import type { ServerProps } from "../initialize";

function createProduct(props: ServerProps) {
  const { repositories, replicacheTransaction } = props;

  return zod(CreateProductSchema, async (input) => {
    const { product, storeId, prices } = input;
    const defaultVariant: ProductVariant = {
      id: product.defaultVariantId,
      productId: product.id,
    };
    const store = await repositories.storeRepository.getStoreById({
      id: storeId,
    });
    if (!store) {
      throw new Error("Store not found");
    }
    await repositories.productRepository.insertProduct({
      product: {
        ...product,
        defaultVariantId: defaultVariant.id,
      },
    });
    await repositories.productVariantRepository.insertProductVariant({
      variant: defaultVariant,
    });
    prices.forEach((price) => {
      replicacheTransaction.set(price.id, price, "prices");
    });
  });
}
function deleteProduct(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(DeleteInputSchema, (input) => {
    const { id } = input;
    replicacheTransaction.del(id, "products");
  });
}
function updateProduct(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(UpdateProductSchema, (input) => {
    const { updates, id } = input;
    replicacheTransaction.set(id, updates, "products");
  });
}
function updateProductImagesOrder(props: ServerProps) {
  const { replicacheTransaction, repositories } = props;
  return zod(UpdateProductImagesOrderSchema, async (input) => {
    const { productId, order, variantId } = input;
    const variant =
      await repositories.productVariantRepository.getProductVariantById(
        variantId,
      );
    if (!variant) {
      throw new Error("Variant not found");
    }
    const images = structuredClone(variant.images) ?? [];
    if (images.length === 0) {
      return;
    }
    for (const image of images) {
      if (order[image.id] !== undefined) image.order = order[image.id]!;
    }
    if (variant.id.startsWith("default")) {
      for (const image of images) {
        console.log("image", image);
        if (image.order === 0) {
          replicacheTransaction.update(
            productId,
            { thumbnail: image },
            "products",
          );
        }
      }
    }
    replicacheTransaction.update(
      variantId,
      { images: images },
      "productVariants",
    );
    replicacheTransaction.update(productId, {}, "products");
  });
}

function uploadProductImages(props: ServerProps) {
  const { replicacheTransaction, repositories } = props;
  return zod(UploadProductImagesSchema, async (input) => {
    const { variantId, images, productId } = input;
    if (images.length === 0) {
      return;
    }
    const variant =
      await repositories.productVariantRepository.getProductVariantById(
        variantId,
      );
    if (!variant) {
      throw new Error("Variant not found");
    }

    replicacheTransaction.update(
      variantId,
      {
        images: [...(variant.images ? variant.images : []), ...images],
      },
      "productVariants",
    );
    replicacheTransaction.update(productId, {}, "products");
  });
}

function createProductOption(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(CreateProductOptionSchema, (input) => {
    const { option } = input;
    replicacheTransaction.set(option.id, option, "productOptions");
    replicacheTransaction.update(option.productId, {}, "products");
  });
}

function updateProductOption(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(UpdateProductOptionSchema, (input) => {
    const { optionId, updates, productId } = input;
    replicacheTransaction.update(optionId, updates, "productOptions");
    replicacheTransaction.update(productId, {}, "products");
  });
}

function deleteProductOption(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(DeleteProductOptionSchema, (input) => {
    const { optionId, productId } = input;
    replicacheTransaction.del(optionId, "productOptions");
    replicacheTransaction.update(productId, {}, "products");
  });
}

function updateProductOptionValues(props: ServerProps) {
  const { replicacheTransaction, repositories } = props;
  return zod(UpdateProductOptionValuesSchema, async (input) => {
    const { optionId, newOptionValues, productId } = input;
    const option =
      await repositories.productOptionRepository.getProductOption(optionId);
    if (!option) {
      return;
    }
    const oldValuesKeys = option.values?.map((value) => value.id) ?? [];
    newOptionValues.forEach((value) => {
      replicacheTransaction.set(value.id, value, "productOptionValues");
    });
    oldValuesKeys.forEach((id) => {
      replicacheTransaction.del(id, "productOptionValues");
    });
    replicacheTransaction.update(productId, {}, "products");
  });
}

function deleteProductOptionValue(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(DeleteProductOptionValueSchema, (input) => {
    const { optionValueId, productId } = input;
    replicacheTransaction.del(optionValueId, "productOptionValues");
    replicacheTransaction.update(productId, {}, "products");
  });
}

function createProductVariant(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(CreateProductVariantSchema, (input) => {
    const { variant } = input;
    replicacheTransaction.set(variant.id, variant, "productVariants");
    replicacheTransaction.update(variant.productId, {}, "products");
  });
}

function updateProductVariant(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(UpdateProductVariantSchema, (input) => {
    const { variantId, updates, productId } = input;
    replicacheTransaction.update(variantId, updates, "productVariants");
    replicacheTransaction.update(productId, {}, "products");
  });
}

function deleteProductVariant(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(DeleteProductVariantSchema, (input) => {
    const { variantId, productId } = input;
    replicacheTransaction.del(variantId, "productVariants");
    replicacheTransaction.update(productId, {}, "products");
  });
}

function createProductPrices(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(CreateProductPricesSchema, (input) => {
    const { prices, productId } = input;
    prices.forEach((price) => {
      replicacheTransaction.set(price.id, price, "prices");
    });
    replicacheTransaction.update(productId, {}, "products");
  });
}

function updateProductPrice(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(UpdateProductPriceSchema, (input) => {
    const { priceId, updates, productId } = input;
    replicacheTransaction.update(priceId, updates, "prices");
    replicacheTransaction.update(productId, {}, "products");
  });
}

function deleteProductPrices(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(DeleteProductPricesSchema, (input) => {
    const { priceIds, productId } = input;
    priceIds.forEach((id) => {
      replicacheTransaction.del(id, "prices");
    });
    replicacheTransaction.update(productId, {}, "products");
  });
}

function assignProductOptionValueToVariant(props: ServerProps) {
  const { replicacheTransaction } = props;
  return zod(AssignProductOptionValueToVariantSchema, (input) => {
    const { optionValueId, variantId, prevOptionValueId, productId } = input;
    replicacheTransaction.set(
      { optionValueId, variantId },
      { optionValueId, variantId },
      "productOptionValuesToProductVariants",
    );
    replicacheTransaction.update(productId, {}, "products");
    if (prevOptionValueId)
      replicacheTransaction.del(
        prevOptionValueId,
        "productOptionValuesToProductVariants",
      );
  });
}

function updateProductTags(props: ServerProps) {
  const { replicacheTransaction, repositories } = props;
  return zod(UpdateProductTagsSchema, async (input) => {
    const { productId, tags } = input;
    const productTagExistenceResults = await Promise.all(
      tags.map(async (tag) => {
        return await repositories.productTagRepository.checkProductTagExists({
          value: tag,
        });
      }),
    );
    const productTagsToCreate: { tag: string }[] = [];
    const productTagsToAssign: { id: string }[] = [];
    for (let i = 0; i < productTagExistenceResults.length; i++) {
      const item = productTagExistenceResults[i];
      if (!item) {
        productTagsToCreate.push({ tag: tags[i]! });
      } else {
        productTagsToAssign.push({ id: item.id });
      }
    }
    const newTags = await repositories.productTagRepository.createProductTags({
      tags: productTagsToCreate.map((value) => {
        return {
          id: generateId({ id: ulid(), prefix: "p_tag" }),
          value: value.tag,
          createdAt: new Date().toISOString(),
        };
      }),
    });
    productTagsToAssign.forEach((tag) =>
      replicacheTransaction.set(
        { productId, tagId: tag.id },
        { productId, tagId: tag.id },
        "productsToTags",
      ),
    );
    for (const newTag of newTags ?? []) {
      replicacheTransaction.set(
        { productId, tagId: newTag.id },
        { productId, tagId: newTag.id },
        "productsToTags",
      );
    }
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
};
