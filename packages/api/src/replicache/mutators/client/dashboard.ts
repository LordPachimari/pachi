import type { WriteTransaction } from "replicache";
import { array, string } from "valibot";

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
  type CustomerGroup,
  type PriceList,
  type Product,
  type ProductCollection,
  type ProductTag,
  type ProductVariant,
  type User,
} from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import type {
  AddCustomerToGroupProps,
  AddProductToPriceListProps,
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

export type DashboardMutators = typeof dashboardMutators;
export const dashboardMutators = {
  createProduct: async (tx: WriteTransaction, props: CreateProductProps) => {
    const { args } = props;
    const { product, defaultVariantId } = args;
    ProductSchema._parse(product);

    const defaultVariant: ProductVariant = {
      id: defaultVariantId,
      productId: product.id,
    };
    await tx.put(product.id, {
      ...product,
      defaultVariantId: defaultVariant.id,
      variants: [defaultVariant],
    });
  },

  deleteProduct: async (tx: WriteTransaction, props: DeleteProps) => {
    const { args } = props;
    const { id } = args;
    string()._parse(id);
    await tx.del(id);
  },

  updateProduct: async (tx: WriteTransaction, props: UpdateProductProps) => {
    const { args } = props;
    const { updates, id } = args;
    ProductUpdatesSchema._parse(updates);
    const product = (await tx.get(id)) as Product | undefined;
    if (!product) {
      console.info(`Product ${id} not found`);
      return;
    }
    await tx.put(id, { ...product, ...updates });
  },
  uploadProductImages: async (
    tx: WriteTransaction,
    props: UploadImagesProps,
  ): Promise<void> => {
    console.log("uploading images for a product");
    const { args } = props;
    const { variantId, images, productId } = args;
    console.log("images", images);
    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      console.log("no product");
      return;
    }
    string()._parse(productId);
    string()._parse(variantId);

    if (images.length > 0) {
      string()._parse(images[0]!.id);
      string()._parse(images[0]!.altText);
    } else {
      console.log("no images");
      return;
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
  },

  updateImagesOrder: async (
    tx: WriteTransaction,
    props: UpdateImagesOrderProps,
  ): Promise<void> => {
    const { args } = props;
    const { order, productId, variantId } = args;
    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      console.info(`Product ${productId} not found`);
      return;
    }
    const images = product.images ? [...product.images] : [];
    if (images.length === 0) {
      return;
    }
    for (const image of images) {
      if (order[image.id]) image.order = order[image.id]!;
    }
    await tx.put(productId, {
      ...product,
      variant: product.variants?.map((variant) => {
        if (variant.id === variantId) {
          return { ...variant, images };
        }
        return variant;
      }),
    });
  },
  createProductOption: async (
    tx: WriteTransaction,
    props: CreateProductOptionProps,
  ) => {
    const { args } = props;
    const { option } = args;
    ProductOptionSchema._parse(option);
    const product = (await tx.get(option.productId)) as Product | undefined;
    if (!product) {
      console.info(`Product ${option.productId} not found`);
      return;
    }
    const product_options = product.options ? product.options : [];
    await Promise.all([
      tx.put(option.id, option),
      tx.put(product.id, {
        ...product,
        options: [...product_options, option],
      }),
    ]);
  },
  updateProductOption: async (
    tx: WriteTransaction,
    { args }: UpdateProductOptionProps,
  ) => {
    const { optionId, productId, updates } = args;
    ProductOptionUpdatesSchema._parse(updates);

    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      console.info(`Product ${productId} not found`);
      return;
    }
    await tx.put(product.id, {
      ...product,
      options: product.options?.map((option) =>
        option.id === optionId ? { ...option, ...updates } : option,
      ),
    });
  },
  deleteProductOption: async (tx: WriteTransaction, { args }: DeleteProps) => {
    const { id, productId } = args;
    string()._parse(id);
    string()._parse(productId);
    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      console.info(`Product ${productId} not found`);
      return;
    }
    const product_options = product.options
      ? product.options.filter((option) => option.id !== id)
      : [];
    await tx.put(product.id, {
      ...product,
      options: product_options,
    });
  },

  createProductOptionValue: async (
    tx: WriteTransaction,
    { args }: CreateProductOptionValueProps,
  ) => {
    const { optionValue } = args;
    ProductOptionValueSchema._parse(optionValue);
    await tx.put(optionValue.id, optionValue);
  },
  updateProductOptionValues: async (
    tx: WriteTransaction,
    { args }: UpdateProductOptionValuesProps,
  ) => {
    const { optionId, productId, newOptionValues } = args;

    array(string())._parse(newOptionValues);
    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      console.info(`Product ${productId} not found`);
      return;
    }
    console.log("new_option_values", newOptionValues);
    const newValues = newOptionValues.map((value) => ({
      id: generateId({ id: ulid(), prefix: "opt_val" }),
      optionId,
      value,
    }));

    await tx.put(product.id, {
      ...product,
      options: product.options?.map((option) =>
        option.id === optionId ? { ...option, values: newValues } : option,
      ),
    });
  },

  deleteProductOptionValue: async (
    tx: WriteTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id);
  },

  createProductVariant: async (
    tx: WriteTransaction,
    { args }: CreateProductVariantProps,
  ) => {
    const { variant } = args;
    ProductVariantSchema._parse(variant);
    const product = (await tx.get(variant.productId)) as Product | undefined;
    if (!product) {
      console.info(`Product  not found`);
      return;
    }
    const variants = product.variants ? [...product.variants] : [];
    variants.push(variant);
    await tx.put(product.id, {
      ...product,
      variants,
    });
  },
  updateProductVariant: async (
    tx: WriteTransaction,
    { args }: UpdateProductVariantProps,
  ) => {
    const { variantId, updates, productId } = args;
    ProductVariantUpdatesSchema._parse(updates);
    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      throw new Error("Product not found");
    }
    if (!product.variants) {
      console.info(`Product  not found`);

      throw new Error("Product variants not found");
    }
    const product_variants = product.variants.map((variant) => {
      if (variant.id === variantId) {
        return { ...variant, ...updates };
      }
      return variant;
    });
    await tx.put(product.id, { ...product, variants: product_variants });
  },

  deleteProductVariant: async (tx: WriteTransaction, { args }: DeleteProps) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id);
  },
  createProductCollection: async (
    tx: WriteTransaction,
    { args }: CreateProductCollectionProps,
  ) => {
    const { collection } = args;
    ProductCollectionSchema._parse(collection);
    await tx.put(collection.id, collection);
  },
  updateProductCollection: async (
    tx: WriteTransaction,
    { args }: UpdateProductCollectionProps,
  ) => {
    const { id, updates } = args;
    ProductCollectionUpdatesSchema._parse(updates);
    const collection = (await tx.get(id)) as ProductCollection | undefined;
    const updated = { ...collection, ...updates };
    await tx.put(id, updated);
  },
  deleteProductCollection: async (
    tx: WriteTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id);
  },

  removeProductFromCollection: async (
    tx: WriteTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    const product = (await tx.get(id)) as Product | undefined;
    if (!product) {
      console.info(`Product ${id} not found`);
      return;
    }
    if (product.collectionId) delete product.collectionId;
    await tx.put(id, product);
  },
  createCustomerGroup: async (
    tx: WriteTransaction,
    { args }: CreateCustomerGroupProps,
  ) => {
    const { group } = args;
    CustomerGroupSchema._parse(group);
    await tx.put(group.id, group);
  },
  updateCustomerGroup: async (
    tx: WriteTransaction,
    { args }: UpdateCustomerGroupProps,
  ) => {
    const { id, updates } = args;
    CustomerGroupUpdatesSchema._parse(updates);
    const group = (await tx.get(id)) as CustomerGroup | undefined;
    const updated = { ...group, ...updates };

    await tx.put(id, updated);
  },
  deleteCustomerGroup: async (tx: WriteTransaction, { args }: DeleteProps) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id);
  },
  addCustomerToGroup: async (
    tx: WriteTransaction,
    { args }: AddCustomerToGroupProps,
  ) => {
    const { customerId, groupId } = args;
    string()._parse(customerId);
    string()._parse(groupId);
    const customerGroup = (await tx.get(groupId)) as CustomerGroup | undefined;
    const customer = (await tx.get(customerId)) as User | undefined;
    if (!customerGroup || !customer) {
      console.info(`Group/customer ${groupId} not found`);
      return;
    }
    customerGroup.customers.push(customer);

    await tx.put(groupId, customerGroup);
  },
  removeCustomerFromGroup: async (
    tx: WriteTransaction,
    { args }: RemoveCustomerFromGroupProps,
  ) => {
    const { customerId, groupId } = args;
    string()._parse(customerId);
    string()._parse(groupId);
    const customerGroup = (await tx.get(groupId)) as CustomerGroup | undefined;
    if (!customerGroup) {
      console.info(`Group/customer ${groupId} not found`);
      return;
    }
    const updated = {
      ...customerGroup,
      customers: customerGroup.customers.filter(
        (customer) => customer.id !== customerId,
      ),
    };
    await tx.put(groupId, updated);
  },
  createPriceList: async (
    tx: WriteTransaction,
    { args }: CreatePriceListProps,
  ) => {
    const { priceList } = args;
    PriceListSchema._parse(priceList);
    await tx.put(priceList.id, priceList);
  },
  updatePriceList: async (
    tx: WriteTransaction,
    { args }: UpdatePriceListProps,
  ) => {
    const { id, updates } = args;
    PriceListUpdatesSchema._parse(updates);
    string()._parse(id);
    const priceList = (await tx.get(id)) as PriceList | undefined;
    if (!priceList) {
      console.info(`Price list ${id} not found`);
      return;
    }
    const updated = { ...priceList, ...updates };

    await tx.put(id, updated);
  },
  deletePriceList: async (tx: WriteTransaction, { args }: DeleteProps) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id);
  },
  addProductToPriceList: async (
    tx: WriteTransaction,
    { args }: AddProductToPriceListProps,
  ) => {
    const { price, priceListId } = args;
    string()._parse(priceListId);
    PriceSchema._parse(price);
    price.priceListId = priceListId;
    const priceList = (await tx.get(priceListId)) as PriceList | undefined;
    if (!priceList) {
      console.info(`Price list ${priceListId} not found`);
      return;
    }
    if (priceList.prices) priceList.prices.push(price);
    else priceList.prices = [price];
    await tx.put(priceListId, priceList);
  },
  removeProductFromPriceList: async (
    tx: WriteTransaction,
    { args }: RemoveProductFromPriceListProps,
  ) => {
    const { priceId, priceListId } = args;
    string()._parse(priceId);
    const priceList = (await tx.get(priceListId)) as PriceList | undefined;
    if (!priceList) {
      console.info(`Price list ${priceId} not found`);
      return;
    }
    priceList.prices = priceList.prices
      ? priceList.prices.filter((price) => price.id !== priceId)
      : [];
    await tx.put(priceId, priceList);
  },
  createPrices: async (tx: WriteTransaction, { args }: CreatePricesProps) => {
    const { prices, productId, variantId } = args;
    array(PriceSchema)._parse(prices);
    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      console.info(`Product  not found`);
      return;
    }
    const variant = product.variants?.find(
      (variant) => variant.id === variantId,
    );
    if (!variant) {
      console.log("variant not found");
      return;
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
  },
  updatePrice: async (tx: WriteTransaction, { args }: UpdatePriceProps) => {
    const { priceId, updates, variantId, productId } = args;

    string()._parse(priceId);
    string()._parse(variantId);
    string()._parse(productId);
    PriceUpdatesSchema._parse(updates);
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
    const variant_prices = variant.prices
      ? variant.prices.map((price) => {
          if (price.id === priceId) return { ...price, ...updates };
          return price;
        })
      : [];

    await tx.put(product.id, {
      ...product,
      variants: product.variants?.map((variant_) =>
        variant_.id === variantId
          ? { ...variant, prices: variant_prices }
          : variant_,
      ),
    });
  },
  deletePrices: async (tx: WriteTransaction, { args }: DeletePricesProps) => {
    const { ids, productId, variantId } = args;
    array(string())._parse(ids);
    string()._parse(productId);
    string()._parse(variantId);
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
    const variant_prices = variant.prices
      ? variant.prices.filter((price) => !ids.includes(price.id))
      : [];
    await tx.put(product.id, {
      ...product,
      variants: product.variants?.map((variant_) =>
        variant_.id === variantId
          ? { ...variant, prices: variant_prices }
          : variant_,
      ),
    });
  },
  updateProductTags: async (
    tx: WriteTransaction,
    { args }: UpdateProductTagsProps,
  ) => {
    const { productId, tags } = args;
    const product = (await tx.get(productId)) as Product | undefined;
    if (!product) {
      throw new Error("Product not found");
    }
    const newProductTags: ProductTag[] = tags.map((tag) => ({
      id: generateId({
        id: ulid(),
        prefix: "p_tag",
      }),
      value: tag,
      createdAt: new Date().toISOString(),
    }));
    await tx.put(productId, { ...product, tags:newProductTags });
  },
};
