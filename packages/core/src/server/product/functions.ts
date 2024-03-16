import { Effect } from "effect";
import { isDefined } from "remeda";

import { type ProductVariant } from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import { NotFound } from "../../schema-and-types";
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
} from "../../schema-and-types/product";
import { zod } from "../../util/zod";
import { ServerContext } from "../context";

const createProduct = zod(CreateProductSchema, (input) =>
  Effect.gen(function* (_) {
    const { repositories, replicacheTransaction } = yield* _(ServerContext);
    const { product, prices } = input;
    const defaultVariant: ProductVariant = {
      id: product.defaultVariantId,
      productId: product.id,
    };

    yield* _(
      repositories.productRepository.insertProduct({
        product: {
          ...product,
          defaultVariantId: defaultVariant.id,
        },
      }),
    );

    yield* _(
      repositories.productVariantRepository.insertProductVariant({
        variant: defaultVariant,
      }),
    );

    yield* _(
      Effect.forEach(
        prices,
        (price) =>
          Effect.sync(() =>
            replicacheTransaction.set(price.id, price, "prices"),
          ),
        {
          concurrency: "unbounded",
        },
      ),
    );
  }),
);

const deleteProduct = zod(DeleteInputSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { id } = input;
    yield* _(Effect.sync(() => replicacheTransaction.del(id, "products")));
  }),
);

const updateProduct = zod(UpdateProductSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { updates, id } = input;

    yield* _(
      Effect.sync(() => replicacheTransaction.set(id, updates, "products")),
    );
  }),
);

const updateProductImagesOrder = zod(UpdateProductImagesOrderSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction, repositories } = yield* _(ServerContext);
    const { productId, order, variantId } = input;
    const variant = yield* _(
      repositories.productVariantRepository.getProductVariantById(variantId),
    );

    if (!variant) {
      Effect.fail(new NotFound({ message: "Variant not found" }));

      return;
    }
    const images = structuredClone(variant.images) ?? [];

    if (images.length === 0) {
      return;
    }

    for (const image of images) {
      const o = order[image.id];

      if (isDefined(o)) image.order = o;
    }

    if (variant.id.startsWith("default")) {
      for (const image of images) {
        if (image.order === 0) {
          replicacheTransaction.update(
            productId,
            { thumbnail: image },
            "products",
          );
        }
      }
    }

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(
          variantId,
          { images: images },
          "productVariants",
        ),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const uploadProductImages = zod(UploadProductImagesSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction, repositories } = yield* _(ServerContext);
    const { variantId, images, productId } = input;

    if (images.length === 0) {
      return;
    }
    const variant = yield* _(
      repositories.productVariantRepository.getProductVariantById(variantId),
    );

    if (!variant) {
      Effect.fail(new NotFound({ message: "Variant not found" }));

      return;
    }

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(
          variantId,
          {
            images: [...(variant.images ? variant.images : []), ...images],
          },
          "productVariants",
        ),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const createProductOption = zod(CreateProductOptionSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { option } = input;

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.set(option.id, option, "productOptions"),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(option.productId, {}, "products"),
      ),
    );
  }),
);

const updateProductOption = zod(UpdateProductOptionSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { optionId, updates, productId } = input;

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(optionId, updates, "productOptions"),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const deleteProductOption = zod(DeleteProductOptionSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { optionId, productId } = input;

    yield* _(
      Effect.sync(() => replicacheTransaction.del(optionId, "productOptions")),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const updateProductOptionValues = zod(
  UpdateProductOptionValuesSchema,
  (input) =>
    Effect.gen(function* (_) {
      const { replicacheTransaction, repositories } = yield* _(ServerContext);
      const { optionId, newOptionValues, productId } = input;
      const option = yield* _(
        repositories.productOptionRepository.getProductOption(optionId),
      );

      if (!option) {
        Effect.fail(new NotFound({ message: "Option not found" }));

        return;
      }
      const oldValuesKeys = option.values?.map((value) => value.id) ?? [];

      yield* _(
        Effect.forEach(
          newOptionValues,
          (value) =>
            Effect.sync(() =>
              replicacheTransaction.set(value.id, value, "productOptionValues"),
            ),
          { concurrency: "unbounded" },
        ),
      );

      yield* _(
        Effect.forEach(
          oldValuesKeys,
          (id) =>
            Effect.sync(() =>
              replicacheTransaction.del(id, "productOptionValues"),
            ),
          { concurrency: "unbounded" },
        ),
      );

      yield* _(
        Effect.sync(() =>
          replicacheTransaction.update(productId, {}, "products"),
        ),
      );
    }),
);

const deleteProductOptionValue = zod(DeleteProductOptionValueSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { optionValueId, productId } = input;

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.del(optionValueId, "productOptionValues"),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const createProductVariant = zod(CreateProductVariantSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { variant } = input;

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.set(variant.id, variant, "productVariants"),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(variant.productId, {}, "products"),
      ),
    );
  }),
);

const updateProductVariant = zod(UpdateProductVariantSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { variantId, updates, productId } = input;

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(variantId, updates, "productVariants"),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const deleteProductVariant = zod(DeleteProductVariantSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { variantId, productId } = input;

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.del(variantId, "productVariants"),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const createProductPrices = zod(CreateProductPricesSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { prices, productId } = input;

    prices.forEach((price) => {
      replicacheTransaction.set(price.id, price, "prices");
    });

    yield* _(
      Effect.forEach(
        prices,
        (price) =>
          Effect.sync(() =>
            replicacheTransaction.set(price.id, price, "prices"),
          ),
        { concurrency: "unbounded" },
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const updateProductPrice = zod(UpdateProductPriceSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { priceId, updates, productId } = input;

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(priceId, updates, "prices"),
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const deleteProductPrices = zod(DeleteProductPricesSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction } = yield* _(ServerContext);
    const { priceIds, productId } = input;

    yield* _(
      Effect.forEach(
        priceIds,
        (id) => Effect.sync(() => replicacheTransaction.del(id, "prices")),
        { concurrency: "unbounded" },
      ),
    );

    yield* _(
      Effect.sync(() =>
        replicacheTransaction.update(productId, {}, "products"),
      ),
    );
  }),
);

const assignProductOptionValueToVariant = zod(
  AssignProductOptionValueToVariantSchema,
  (input) =>
    Effect.gen(function* (_) {
      const { replicacheTransaction } = yield* _(ServerContext);
      const { optionValueId, variantId, prevOptionValueId, productId } = input;

      yield* _(
        Effect.sync(() =>
          replicacheTransaction.set(
            { optionValueId, variantId },
            { optionValueId, variantId },
            "productOptionValuesToProductVariants",
          ),
        ),
      );

      yield* _(
        Effect.sync(() =>
          replicacheTransaction.update(productId, {}, "products"),
        ),
      );

      if (prevOptionValueId)
        yield* _(
          Effect.sync(() =>
            replicacheTransaction.del(
              prevOptionValueId,
              "productOptionValuesToProductVariants",
            ),
          ),
        );
    }),
);

const updateProductTags = zod(UpdateProductTagsSchema, (input) =>
  Effect.gen(function* (_) {
    const { replicacheTransaction, repositories } = yield* _(ServerContext);
    const { productId, tags } = input;

    yield* _(
      repositories.productTagRepository.deleteTagsFromProduct({
        productId,
      }),
    );

    const newTags = yield* _(
      repositories.productTagRepository.createProductTags({
        tags: tags.map((value) => {
          return {
            id: generateId({ id: ulid(), prefix: "p_tag" }),
            value,
            createdAt: new Date().toISOString(),
          };
        }),
      }),
    );

    yield* _(
      Effect.forEach(
        newTags,
        (tag) =>
          Effect.sync(() =>
            replicacheTransaction.set(
              { productId, tagId: tag.id },
              { productId, tagId: tag.id },
              "productsToTags",
            ),
          ),
        { concurrency: "unbounded" },
      ),
    );
  }),
);

export {
  createProduct,
  assignProductOptionValueToVariant,
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
  updateProductTags,
  updateProductVariant,
  uploadProductImages,
};
