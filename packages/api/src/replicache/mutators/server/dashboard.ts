import { array, number, record, string } from "valibot";

import {
  CustomerGroupSchema,
  CustomerGroupUpdatesSchema,
  PriceListSchema,
  PriceListUpdatesSchema,
  PriceSchema,
  PriceUpdatesSchema,
  ProductCollectionSchema,
  ProductCollectionUpdatesSchema,
  ProductOptionSchema,
  ProductOptionUpdatesSchema,
  ProductOptionValueSchema,
  ProductSchema,
  ProductUpdatesSchema,
  ProductVariantSchema,
  ProductVariantUpdatesSchema,
  type Price,
  type ProductVariant,
} from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import type {
  AddCustomerToGroupProps,
  AddProductToPriceListProps,
  AssignProductOptionValueToVariantProps,
  CreateCustomerGroupProps,
  CreatePriceListProps,
  CreatePricesProps,
  CreateProductCollectionProps,
  CreateProductOptionProps,
  CreateProductOptionValueProps,
  CreateProductProps,
  CreateProductVariantProps,
  DeletePricesProps,
  DeleteProps,
  RemoveCustomerFromGroupProps,
  RemoveProductFromPriceListProps,
  UpdateCustomerGroupProps,
  UpdateImagesOrderProps,
  UpdatePriceListProps,
  UpdatePriceProps,
  UpdateProductCollectionProps,
  UpdateProductOptionProps,
  UpdateProductOptionValuesProps,
  UpdateProductProps,
  UpdateProductTagsProps,
  UpdateProductVariantProps,
  UploadImagesProps,
} from "../../../types/mutators";
import type { ReplicacheTransaction } from "../../replicache-transaction/transaction";

export type DashboardMutators_ = typeof dashboardMutators_;
export const dashboardMutators_ = {
  createProduct: async (
    tx: ReplicacheTransaction,
    props: CreateProductProps,
  ) => {
    const { args, repositories } = props;
    const { product, defaultVariantId, storeId, prices } = args;
    ProductSchema._parse(product);

    const defaultVariant: ProductVariant = {
      id: defaultVariantId,
      productId: product.id,
    };
    const store = await repositories?.storeRepository.getStoreById({
      id: storeId,
    });
    if (!store) {
      return;
    }

    await repositories?.productRepository.insertProduct({
      product: {
        ...product,
        defaultVariantId: defaultVariant.id,
      },
    });
    await repositories?.productVariantRepository.insertProductVariant({
      variant: defaultVariant,
    });
    await Promise.all(
      prices.map((price) => {
        return tx.put(price.id, price, "prices");
      }),
    );
  },

  deleteProduct: async (tx: ReplicacheTransaction, props: DeleteProps) => {
    const { args } = props;
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "products");
  },

  updateProduct: async (
    tx: ReplicacheTransaction,
    props: UpdateProductProps,
  ) => {
    const { args } = props;
    const { updates, id } = args;
    ProductUpdatesSchema._parse(updates);
    await tx.update(id, updates, "products");
  },

  updateImagesOrder: async (
    tx: ReplicacheTransaction,
    props: UpdateImagesOrderProps,
  ) => {
    const { args, repositories } = props;
    const { order, variantId, productId } = args;
    record(string(), number())._parse(order);
    console.log("order", order);
    const variant =
      await repositories?.productVariantRepository.getProductVariantById({
        id: variantId,
      });
    if (!variant) {
      return;
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
          await tx.update(productId, { thumbnail: image }, "products");
        }
      }
    }
    await tx.update(variantId, { images: images }, "productVariants");
    await tx.update(productId, {}, "products");
  },
  uploadProductImages: async (
    tx: ReplicacheTransaction,
    props: UploadImagesProps,
  ) => {
    const { args, repositories } = props;
    const { variantId, images, productId } = args;
    const variant =
      (await repositories?.productVariantRepository.getProductVariantById({
        id: variantId,
      })) as ProductVariant | undefined;
    if (!variant) {
      console.log("no variants");
      return;
    }
    string()._parse(variantId);

    if (images.length > 0) {
      string()._parse(images[0]!.id);
      string()._parse(images[0]!.altText);
    }

    await Promise.all([
      tx.update(
        variantId,
        {
          images: [...(variant.images ? variant.images : []), ...images],
        },
        "productVariants",
      ),
      tx.update(productId, {}, "products"),
    ]);
  },

  createProductOption: async (
    tx: ReplicacheTransaction,
    props: CreateProductOptionProps,
  ) => {
    const { args } = props;
    const { option } = args;
    console.log("creating product option", option);
    ProductOptionSchema._parse(option);
    await Promise.all([
      tx.put(option.id, option, "productOptions"),
      tx.update(option.productId, {}, "products"),
    ]);
  },

  updateProductOption: async (
    tx: ReplicacheTransaction,
    { args }: UpdateProductOptionProps,
  ) => {
    const { optionId, updates, productId } = args;
    ProductOptionUpdatesSchema._parse(updates);
    await Promise.all([
      tx.update(optionId, updates, "productOptions"),
      tx.update(productId, {}, "products"),
    ]);
  },

  deleteProductOption: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id, productId } = args;
    string()._parse(id);
    await Promise.all([
      tx.del(id, "productOptions"),
      tx.update(productId, {}, "products"),
    ]);
  },

  updateProductOptionValues: async (
    tx: ReplicacheTransaction,
    { args, repositories }: UpdateProductOptionValuesProps,
  ) => {
    const { optionId, newOptionValues, productId } = args;
    array(ProductOptionValueSchema)._parse(newOptionValues);
    const option = await repositories?.productOptionRepository.getProductOption(
      { id: optionId },
    );
    console.log("option from server", option);
    if (!option) {
      return;
    }
    const oldValuesKeys = option.values?.map((value) => value.id) ?? [];
    await Promise.all(
      newOptionValues.map(async (value) => {
        await tx.put(value.id, value, "productOptionValues");
      }),
    );
    await Promise.all(
      oldValuesKeys.map(async (id) => {
        await tx.del(id, "productOptionValues");
      }),
    );
    await tx.update(productId, {}, "products");
  },

  deleteProductOptionValue: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id, productId } = args;
    string()._parse(id);
    await Promise.all([
      tx.del(id, "productOptionValues"),
      tx.update(productId, {}, "products"),
    ]);
  },

  createProductVariant: async (
    tx: ReplicacheTransaction,
    { args }: CreateProductVariantProps,
  ) => {
    const { variant } = args;
    ProductVariantSchema._parse(variant);
    console.log("new variant from the server", variant);
    await Promise.all([
      tx.put(variant.id, variant, "productVariants"),
      tx.update(variant.productId, {}, "products"),
    ]);
  },

  updateProductVariant: async (
    tx: ReplicacheTransaction,
    { args }: UpdateProductVariantProps,
  ) => {
    const { variantId, updates, productId } = args;
    ProductVariantUpdatesSchema._parse(updates);
    await Promise.all([
      tx.update(variantId, updates, "productVariants"),
      tx.update(productId, {}, "products"),
    ]);
  },

  deleteProductVariant: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id, productId } = args;
    string()._parse(id);
    await Promise.all([
      tx.del(id, "productVariants"),
      tx.update(productId, {}, "products"),
    ]);
  },

  createProductCollection: async (
    tx: ReplicacheTransaction,
    { args }: CreateProductCollectionProps,
  ) => {
    const { collection } = args;
    ProductCollectionSchema._parse(collection);
    await tx.put(collection.id, collection, "productCollections");
  },
  updateProductCollection: async (
    tx: ReplicacheTransaction,
    { args }: UpdateProductCollectionProps,
  ) => {
    const { id, updates } = args;
    ProductCollectionUpdatesSchema._parse(updates);
    await tx.update(id, updates, "productCollections");
  },
  deleteProductCollection: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "productCollections");
  },
  removeProductFromCollection: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.update(id, { collection_id: null }, "products");
  },
  createCustomerGroup: async (
    tx: ReplicacheTransaction,
    { args }: CreateCustomerGroupProps,
  ) => {
    const { group } = args;
    CustomerGroupSchema._parse(group);
    await tx.put(group.id, group, "customerGroups");
  },
  updateCustomerGroup: async (
    tx: ReplicacheTransaction,
    { args }: UpdateCustomerGroupProps,
  ) => {
    const { id, updates } = args;
    CustomerGroupUpdatesSchema._parse(updates);
    await tx.update(id, updates, "customerGroups");
  },
  deleteCustomerGroup: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "customerGroups");
  },
  addCustomerToGroup: async (
    tx: ReplicacheTransaction,
    { args }: AddCustomerToGroupProps,
  ) => {
    const { customerId, groupId } = args;
    string()._parse(customerId);
    string()._parse(groupId);
    await tx.put(
      { customerId, groupId },
      { customerId, groupId },
      "customersToGroups",
    );
  },
  removeCustomerFromGroup: async (
    tx: ReplicacheTransaction,
    { args }: RemoveCustomerFromGroupProps,
  ) => {
    const { customerId } = args;
    string()._parse(customerId);
    await tx.del(customerId, "customersToGroups");
  },

  createPriceList: async (
    tx: ReplicacheTransaction,
    { args }: CreatePriceListProps,
  ) => {
    const { priceList } = args;
    PriceListSchema._parse(priceList);
    const prices = priceList.prices;
    delete priceList.prices;
    if (prices && prices.length > 0) {
      await Promise.all(
        prices.map(async (price) => {
          price.priceListId = priceList.id;
          await tx.put(price.id, price, "prices");
        }),
      );
    }
    await tx.put(priceList.id, priceList, "priceLists");
  },
  updatePriceList: async (
    tx: ReplicacheTransaction,
    { args }: UpdatePriceListProps,
  ) => {
    const { id, updates } = args;
    PriceListUpdatesSchema._parse(updates);
    await tx.update(id, updates, "priceLists");
  },
  deletePriceList: async (tx: ReplicacheTransaction, { args }: DeleteProps) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "priceLists");
  },
  addProductToPriceList: async (
    tx: ReplicacheTransaction,
    { args }: AddProductToPriceListProps,
  ) => {
    const { price, priceListId } = args;
    string()._parse(priceListId);
    PriceSchema._parse(price);
    price.priceListId = priceListId;
    await tx.put(price.id, price, "prices");
  },
  removeProductFromPriceList: async (
    tx: ReplicacheTransaction,
    { args }: RemoveProductFromPriceListProps,
  ) => {
    const { priceId } = args;
    string()._parse(priceId);
    await tx.del(priceId, "prices");
  },
  createPrices: async (
    tx: ReplicacheTransaction,
    { args }: CreatePricesProps,
  ) => {
    const { prices, productId } = args;
    string()._parse(productId);
    array(PriceSchema)._parse(prices);
    console.log("prices to create", prices);
    await Promise.all(
      prices.map(async (price) => {
        await tx.put(price.id, price, "prices");
      }),
    );
    await tx.update(productId, {}, "products");
  },
  updatePrice: async (
    tx: ReplicacheTransaction,
    { args }: UpdatePriceProps,
  ) => {
    const { priceId, updates, productId } = args;
    string()._parse(priceId);
    PriceUpdatesSchema._parse(updates);

    await Promise.all([
      tx.update(priceId, updates, "prices"),
      tx.update(productId, {}, "products"),
    ]);
  },
  deletePrices: async (
    tx: ReplicacheTransaction,
    { args }: DeletePricesProps,
  ) => {
    const { ids, productId } = args;
    array(string())._parse(ids);
    await Promise.all(
      ids.map(async (id) => {
        await tx.del(id, "prices");
      }),
    );
    await tx.update(productId, {}, "products");
  },
  updateProductTags: async (
    tx: ReplicacheTransaction,
    { args, repositories }: UpdateProductTagsProps,
  ) => {
    const checkProductTagExistenceQueries = [];
    const { productId, tags } = args;
    for (const tag of tags) {
      checkProductTagExistenceQueries.push(
        repositories?.productTagRepository.checkProductTagExists({
          value: tag,
        }),
      );
    }
    const productTagExistenceResults = await Promise.all(
      checkProductTagExistenceQueries,
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
    const newTags = await repositories?.productTagRepository.createProductTags({
      tags: productTagsToCreate.map((value) => {
        return {
          id: generateId({ id: ulid(), prefix: "p_tag" }),
          value: value.tag,
          createdAt: new Date().toISOString(),
        };
      }),
    });

    const productTagAssignmentQueries = productTagsToAssign.map((t) =>
      tx.put(
        { productId, tagId: t.id },
        { productId, tagId: t.id },
        "productsToTags",
      ),
    );
    for (const newTag of newTags ?? []) {
      productTagAssignmentQueries.push(
        tx.put(
          { productId, tagId: newTag.id },
          { productId, tagId: newTag.id },
          "productsToTags",
        ),
      );
    }
    await Promise.all(productTagAssignmentQueries);
  },
  assignProductOptionValueToVariant: async (
    tx: ReplicacheTransaction,
    { args }: AssignProductOptionValueToVariantProps,
  ) => {
    const { optionValueId, variantId, prevOptionValueId, productId } = args;
    await Promise.all([
      tx.put(
        { optionValueId, variantId },
        { optionValueId, variantId },
        "productOptionValuesToProductVariants",
      ),
      tx.update(productId, {}, "products"),
    ]);
    if (prevOptionValueId)
      await tx.del(prevOptionValueId, "productOptionValuesToProductVariants");
  },
};

//if you forgor, then dont do productOptionValue id generated on client
