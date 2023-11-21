import { array, number, record, string } from "valibot";

import {
  CustomerGroupSchema,
  CustomerGroupUpdatesSchema,
  MoneyAmountSchema,
  MoneyAmountUpdatesSchema,
  PriceListSchema,
  PriceListUpdatesSchema,
  ProductCollectionSchema,
  ProductCollectionUpdatesSchema,
  ProductOptionSchema,
  ProductOptionUpdatesSchema,
  ProductOptionValueSchema,
  ProductSchema,
  ProductUpdatesSchema,
  ProductVariantSchema,
  ProductVariantUpdatesSchema,
  type ProductVariant,
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
    const { args, repositories, user } = props;
    const { product, default_variant_id } = args;
    ProductSchema._parse(product);

    const default_variant: ProductVariant = {
      id: default_variant_id,
      product_id: product.id,
    };
    await repositories?.product_repository.insertProduct({
      ...product,
      default_variant_id: default_variant.id,
      unauthenticated: user?.email ? false : true,
    });
    await tx.put(default_variant.id, default_variant, "product_variants");
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
    const { order, variant_id } = args;
    record(string(), number())._parse(order);
    const variant =
      await repositories?.product_variant_repository.getProductVariantById(
        variant_id,
      );
    if (!variant) {
      return;
    }
    const images = variant.images ?? [];
    if (images.length === 0) {
      return;
    }
    for (const image of images) {
      if (order[image.id]) image.order = order[image.id]!;
    }
    await tx.update(variant_id, { images: images }, "product_variants");
  },
  uploadProductImages: async (
    tx: ReplicacheTransaction,
    props: UploadImagesProps,
  ) => {
    const { args, repositories } = props;
    const { variant_id, images } = args;
    const variant =
      (await repositories?.product_variant_repository.getProductVariantById(
        variant_id,
      )) as ProductVariant | undefined;
    if (!variant) {
      console.log("no variants");
      return;
    }
    string()._parse(variant_id);

    if (images.length > 0) {
      string()._parse(images[0]!.id);
      string()._parse(images[0]!.name);
    }

    await tx.update(
      variant_id,
      {
        images: [...(variant.images ? variant.images : []), ...images],
      },
      "products",
    );
  },

  createProductOption: async (
    tx: ReplicacheTransaction,
    props: CreateProductOptionProps,
  ) => {
    const { args } = props;
    const { option } = args;
    console.log("creating product option", option);
    ProductOptionSchema._parse(option);
    await tx.put(option.id, option, "product_options");
  },

  updateProductOption: async (
    tx: ReplicacheTransaction,
    { args }: UpdateProductOptionProps,
  ) => {
    const { option_id, updates } = args;
    ProductOptionUpdatesSchema._parse(updates);
    await tx.update(option_id, updates, "product_options");
  },

  deleteProductOption: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "product_options");
  },

  createProductOptionValue: async (
    tx: ReplicacheTransaction,
    { args }: CreateProductOptionValueProps,
  ) => {
    const { option_value } = args;

    ProductOptionValueSchema._parse(option_value);
    await tx.put(option_value.id, option_value, "product_option_values");
  },

  updateProductOptionValues: async (
    tx: ReplicacheTransaction,
    { args, repositories }: UpdateProductOptionValuesProps,
  ) => {
    const { option_id, new_option_values } = args;
    array(string())._parse(new_option_values);
    const option =
      await repositories?.product_option_repository.getProductOption(option_id);
    console.log("option from server", option);
    if (!option) {
      return;
    }
    const oldValuesKeys = option.values?.map((value) => value.id) ?? [];
    console.log("new_option_values", new_option_values);
    console.log("old values keys", oldValuesKeys);
    const newValues = new_option_values.map((value) => ({
      id: generateId({ id: ulid(), prefix: "opt_val" }),
      option_id,
      value,
    }));
    await Promise.all(
      newValues.map(async (value) => {
        await tx.put(value.id, value, "product_option_values");
      }),
    );
    await Promise.all(
      oldValuesKeys.map(async (id) => {
        await tx.del(id, "product_option_values");
      }),
    );
  },

  deleteProductOptionValue: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "product_option_values");
  },

  createProductVariant: async (
    tx: ReplicacheTransaction,
    { args }: CreateProductVariantProps,
  ) => {
    const { variant } = args;
    ProductVariantSchema._parse(variant);
    console.log("new variant from the server", variant);
    await Promise.all([
      tx.put(variant.id, variant, "product_variants"),
      tx.update(variant.product_id, {}, "products"),
    ]);
  },

  updateProductVariant: async (
    tx: ReplicacheTransaction,
    { args }: UpdateProductVariantProps,
  ) => {
    const { variant_id, updates } = args;
    ProductVariantUpdatesSchema._parse(updates);
    await tx.update(variant_id, updates, "product_variants");
  },

  deleteProductVariant: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "product_variants");
  },

  createProductCollection: async (
    tx: ReplicacheTransaction,
    { args }: CreateProductCollectionProps,
  ) => {
    const { collection } = args;
    ProductCollectionSchema._parse(collection);
    await tx.put(collection.id, collection, "product_collections");
  },
  updateProductCollection: async (
    tx: ReplicacheTransaction,
    { args }: UpdateProductCollectionProps,
  ) => {
    const { id, updates } = args;
    ProductCollectionUpdatesSchema._parse(updates);
    await tx.update(id, updates, "product_collections");
  },
  deleteProductCollection: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "product_collections");
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
    await tx.put(group.id, group, "customer_groups");
  },
  updateCustomerGroup: async (
    tx: ReplicacheTransaction,
    { args }: UpdateCustomerGroupProps,
  ) => {
    const { id, updates } = args;
    CustomerGroupUpdatesSchema._parse(updates);
    await tx.update(id, updates, "customer_groups");
  },
  deleteCustomerGroup: async (
    tx: ReplicacheTransaction,
    { args }: DeleteProps,
  ) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "customer_groups");
  },
  addCustomerToGroup: async (
    tx: ReplicacheTransaction,
    { args }: AddCustomerToGroupProps,
  ) => {
    const { customer_id, group_id } = args;
    string()._parse(customer_id);
    string()._parse(group_id);
    await tx.put(
      { customer_id, group_id },
      { customer_id, group_id },
      "customers_to_groups",
    );
  },
  removeCustomerFromGroup: async (
    tx: ReplicacheTransaction,
    { args }: RemoveCustomerFromGroupProps,
  ) => {
    const { customer_id } = args;
    string()._parse(customer_id);
    await tx.del(customer_id, "customers_to_groups");
  },

  createPriceList: async (
    tx: ReplicacheTransaction,
    { args }: CreatePriceListProps,
  ) => {
    const { price_list } = args;
    PriceListSchema._parse(price_list);
    const prices = price_list.prices;
    delete price_list.prices;
    if (prices && prices.length > 0) {
      await Promise.all(
        prices.map(async (price) => {
          price.price_list_id = price_list.id;
          await tx.put(price.id, price, "money_amount");
        }),
      );
    }
    await tx.put(price_list.id, price_list, "price_lists");
  },
  updatePriceList: async (
    tx: ReplicacheTransaction,
    { args }: UpdatePriceListProps,
  ) => {
    const { id, updates } = args;
    PriceListUpdatesSchema._parse(updates);
    await tx.update(id, updates, "price_lists");
  },
  deletePriceList: async (tx: ReplicacheTransaction, { args }: DeleteProps) => {
    const { id } = args;
    string()._parse(id);
    await tx.del(id, "price_lists");
  },
  addProductToPriceList: async (
    tx: ReplicacheTransaction,
    { args }: AddProductToPriceListProps,
  ) => {
    const { price, price_list_id } = args;
    string()._parse(price_list_id);
    MoneyAmountSchema._parse(price);
    price.price_list_id = price_list_id;
    await tx.put(price.id, price, "money_amount");
  },
  removeProductFromPriceList: async (
    tx: ReplicacheTransaction,
    { args }: RemoveProductFromPriceListProps,
  ) => {
    const { price_id } = args;
    string()._parse(price_id);
    await tx.del(price_id, "money_amount");
  },
  createPrices: async (
    tx: ReplicacheTransaction,
    { args }: CreatePricesProps,
  ) => {
    const { prices, product_id } = args;
    string()._parse(product_id);
    array(MoneyAmountSchema)._parse(prices);
    console.log("prices to create", prices);
    await Promise.all(
      prices.map(async (price) => {
        await tx.put(price.id, price, "money_amount");
      }),
    );
  },
  updatePrice: async (
    tx: ReplicacheTransaction,
    { args }: UpdatePriceProps,
  ) => {
    const { money_amount_id, updates, product_id } = args;
    string()._parse(money_amount_id);
    MoneyAmountUpdatesSchema._parse(updates);

    await Promise.all([
      tx.update(money_amount_id, updates, "money_amount"),
      tx.update(product_id, {}, "products"),
    ]);
  },
  deletePrices: async (
    tx: ReplicacheTransaction,
    { args }: DeletePricesProps,
  ) => {
    const { ids } = args;
    array(string())._parse(ids);
    await Promise.all(
      ids.map(async (id) => {
        await tx.del(id, "money_amount");
      }),
    );
  },
};
