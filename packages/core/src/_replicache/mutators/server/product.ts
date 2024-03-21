import { Effect } from "effect";
import { isDefined } from "remeda";

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
  NotFound,
  UpdateProductImagesOrderSchema,
  UpdateProductOptionSchema,
  UpdateProductOptionValuesSchema,
  UpdateProductPriceSchema,
  UpdateProductSchema,
  UpdateProductVariantSchema,
  UploadProductImagesSchema,
  type Server,
} from "@pachi/validators";

import {
  ProductOptionRepository,
  ProductVariantRepository,
} from "../../../repository";
import { TableMutator } from "../../../..";
import { zod } from "../../../util/zod";

const createProduct = zod(CreateProductSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { product, prices } = input;
    const defaultVariant: Server.ProductVariant = {
      id: product.defaultVariantId,
      productId: product.id,
    };
    const setProduct = tableMutator.set(
      { ...product, defaultVariantId: defaultVariant.id },
      "products",
    );
    const setDefaultVariant = tableMutator.set(
      defaultVariant,
      "productVariants",
    );
    const setPrices = tableMutator.set(prices, "prices");

    return Effect.all([setProduct, setDefaultVariant, setPrices], {
      concurrency: "unbounded",
    });
  }),
);

const deleteProduct = zod(DeleteInputSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { id } = input;

    return tableMutator.delete(id, "products");
  }),
);

const updateProduct = zod(UpdateProductSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { updates, id } = input;

    return tableMutator.update(id, updates, "products");
  }),
);

const updateProductImagesOrder = zod(UpdateProductImagesOrderSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { productId, order, variantId } = input;
    const variant = yield* _(
      ProductVariantRepository.getVariantByID({ id: variantId }),
    );

    if (!variant) {
      return yield* _(
        Effect.fail(new NotFound({ message: "Variant not found" })),
      );
    }
    const images = structuredClone(variant.images) ?? [];

    if (images.length === 0) {
      return;
    }

    for (const image of images) {
      const o = order[image.id];

      if (isDefined(o)) image.order = o;
    }
    const effects = [];

    if (variant.id.startsWith("default")) {
      for (const image of images) {
        if (image.order === 0) {
          effects.push(
            tableMutator.update(productId, { thumbnail: image }, "products"),
          );
        }
      }
    }

    effects.push(tableMutator.update(variantId, { images }, "productVariants"));

    return Effect.all(effects, { concurrency: "unbounded" });
  }),
);

const uploadProductImages = zod(UploadProductImagesSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { variantId, images, productId } = input;

    if (images.length === 0) {
      return;
    }
    const variant = yield* _(
      ProductVariantRepository.getVariantByID({ id: variantId }),
    );

    if (!variant) {
      Effect.fail(new NotFound({ message: "Variant not found" }));

      return;
    }

    const variantUpdate = tableMutator.update(
      variantId,
      {
        images: [...(variant.images ? variant.images : []), ...images],
      },
      "productVariants",
    );
    const productUpdate = tableMutator.update(productId, {}, "products");

    return Effect.all([variantUpdate, productUpdate], {
      concurrency: "unbounded",
    });
  }),
);

const createProductOption = zod(CreateProductOptionSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);

    const { option } = input;
    const productOptionSet = tableMutator.set(option, "productOptions");
    const productUpdate = tableMutator.update(option.productId, {}, "products");

    return Effect.all([productOptionSet, productUpdate], {
      concurrency: "unbounded",
    });
  }),
);

const updateProductOption = zod(UpdateProductOptionSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { optionId, updates, productId } = input;

    const productOptionUpdate = tableMutator.update(
      optionId,
      updates,
      "productOptions",
    );
    const productUpdate = tableMutator.update(productId, {}, "products");

    return Effect.all([productOptionUpdate, productUpdate], {
      concurrency: "unbounded",
    });
  }),
);

const deleteProductOption = zod(DeleteProductOptionSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { optionId, productId } = input;

    const productOptionDelete = tableMutator.delete(optionId, "productOptions");
    const productUpdate = tableMutator.update(productId, {}, "products");

    return Effect.all([productOptionDelete, productUpdate], {
      concurrency: "unbounded",
    });
  }),
);

const updateProductOptionValues = zod(
  UpdateProductOptionValuesSchema,
  (input) =>
    Effect.gen(function* (_) {
      const tableMutator = yield* _(TableMutator);
      const { optionId, newOptionValues, productId } = input;
      const option = yield* _(
        ProductOptionRepository.getOptionByID({
          id: optionId,
          _with: { values: true },
        }),
      );

      if (!option) {
        return Effect.fail(new NotFound({ message: "Option not found" }));
      }

      const oldValuesKeys = option.values?.map((value) => value.id) ?? [];

      const setOptionValues = tableMutator.set(
        newOptionValues,
        "productOptionValues",
      );
      const deleteOptionValues = tableMutator.delete(
        oldValuesKeys,
        "productOptionValues",
      );
      const updateProduct = tableMutator.update(productId, {}, "products");

      return Effect.all([setOptionValues, deleteOptionValues, updateProduct], {
        concurrency: "unbounded",
      });
    }),
);

const deleteProductOptionValue = zod(DeleteProductOptionValueSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { optionValueId, productId } = input;

    const productOptionValueDelete = tableMutator.delete(
      optionValueId,
      "productOptionValues",
    );

    const productUpdate = tableMutator.update(productId, {}, "products");

    return Effect.all([productOptionValueDelete, productUpdate], {
      concurrency: "unbounded",
    });
  }),
);

const createProductVariant = zod(CreateProductVariantSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { variant } = input;

    const setVariant = tableMutator.set(variant, "productVariants");
    const setProduct = tableMutator.update(variant.productId, {}, "products");

    return Effect.all([setVariant, setProduct], { concurrency: "unbounded" });
  }),
);

const updateProductVariant = zod(UpdateProductVariantSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { variantId, updates, productId } = input;

    const updateVariant = tableMutator.update(
      variantId,
      updates,
      "productVariants",
    );

    const updateProduct = tableMutator.update(productId, {}, "products");

    return Effect.all([updateVariant, updateProduct], {
      concurrency: "unbounded",
    });
  }),
);

const deleteProductVariant = zod(DeleteProductVariantSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { variantId, productId } = input;

    const deleteVariant = tableMutator.delete(variantId, "productVariants");
    const updateProduct = tableMutator.update(productId, {}, "products");

    return Effect.all([deleteVariant, updateProduct], {
      concurrency: "unbounded",
    });
  }),
);

const createProductPrices = zod(CreateProductPricesSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { prices, productId } = input;

    const setPrices = tableMutator.set(prices, "prices");
    const updateProduct = tableMutator.update(productId, {}, "products");

    return Effect.all([setPrices, updateProduct], { concurrency: "unbounded" });
  }),
);

const updateProductPrice = zod(UpdateProductPriceSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { priceId, updates, productId } = input;

    const updatePrice = tableMutator.update(priceId, updates, "prices");
    const updateProduct = tableMutator.update(productId, {}, "products");

    return Effect.all([updatePrice, updateProduct], {
      concurrency: "unbounded",
    });
  }),
);

const deleteProductPrices = zod(DeleteProductPricesSchema, (input) =>
  Effect.gen(function* (_) {
    const tableMutator = yield* _(TableMutator);
    const { priceIds, productId } = input;

    const deletePrices = tableMutator.delete(priceIds, "prices");
    const updateProduct = tableMutator.update(productId, {}, "products");

    return Effect.all([deletePrices, updateProduct], {
      concurrency: "unbounded",
    });
  }),
);

const assignProductOptionValueToVariant = zod(
  AssignProductOptionValueToVariantSchema,
  (input) =>
    Effect.gen(function* (_) {
      const tableMutator = yield* _(TableMutator);
      const { optionValueId, variantId, prevOptionValueId, productId } = input;

      const setRelationship = tableMutator.set(
        { optionValueId, variantId },
        "productOptionValuesToProductVariants",
      );
      const updateProduct = tableMutator.update(productId, {}, "products");
      const effects = [setRelationship, updateProduct];

      if (prevOptionValueId)
        effects.push(
          tableMutator.delete(
            prevOptionValueId,
            "productOptionValuesToProductVariants",
          ),
        );

      return Effect.all(effects, { concurrency: "unbounded" });
    }),
);

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
