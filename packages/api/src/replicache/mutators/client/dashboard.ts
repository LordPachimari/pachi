import type { WriteTransaction } from "replicache";
import { array, string } from "valibot";

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
  type CustomerGroup,
  type PriceList,
  type Product,
  type ProductCollection,
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
  UpdateProductVariantProps,
  UploadImagesProps,
} from "../../../types/mutators";

export type DashboardMutators = typeof dashboardMutators;
export const dashboardMutators = {
  createProduct: async (tx: WriteTransaction, props: CreateProductProps) => {
    const { args } = props;
    const { product, default_variant_id } = args;
    ProductSchema._parse(product);

    const default_variant: ProductVariant = {
      id: default_variant_id,
      product_id: product.id,
    };
    await tx.put(product.id, {
      ...product,
      default_variant_id: default_variant.id,
      variants: [default_variant],
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
    const { variant_id, images, product_id } = args;
    console.log("images", images);
    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      console.log("no product");
      return;
    }
    string()._parse(product_id);
    string()._parse(variant_id);

    if (images.length > 0) {
      string()._parse(images[0]!.id);
      string()._parse(images[0]!.name);
    } else {
      console.log("no images");
      return;
    }

    const newProduct = {
      ...product,
      variants: product.variants?.map((variant) => {
        if (variant.id === variant_id) {
          return {
            ...variant,
            images: [...(variant.images ? variant.images : []), ...images],
          };
        }
        return variant;
      }),
    };
    console.log("new product", newProduct);
    await tx.put(product_id, newProduct);
  },

  updateImagesOrder: async (
    tx: WriteTransaction,
    props: UpdateImagesOrderProps,
  ): Promise<void> => {
    const { args } = props;
    const { order, product_id, variant_id } = args;
    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      console.info(`Product ${product_id} not found`);
      return;
    }
    const images = product.images ? [...product.images] : [];
    if (images.length === 0) {
      return;
    }
    for (const image of images) {
      if (order[image.id]) image.order = order[image.id]!;
    }
    await tx.put(product_id, {
      ...product,
      variant: product.variants?.map((variant) => {
        if (variant.id === variant_id) {
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
    const product = (await tx.get(option.product_id)) as Product | undefined;
    if (!product) {
      console.info(`Product ${option.product_id} not found`);
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
    const { option_id, product_id, updates } = args;
    ProductOptionUpdatesSchema._parse(updates);

    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      console.info(`Product ${product_id} not found`);
      return;
    }
    await tx.put(product.id, {
      ...product,
      options: product.options?.map((option) =>
        option.id === option_id ? { ...option, ...updates } : option,
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
    const { option_value } = args;
    ProductOptionValueSchema._parse(option_value);
    await tx.put(option_value.id, option_value);
  },
  updateProductOptionValues: async (
    tx: WriteTransaction,
    { args }: UpdateProductOptionValuesProps,
  ) => {
    const { option_id, product_id, new_option_values } = args;

    array(string())._parse(new_option_values);
    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      console.info(`Product ${product_id} not found`);
      return;
    }
    console.log("new_option_values", new_option_values);
    const newValues = new_option_values.map((value) => ({
      id: generateId({ id: ulid(), prefix: "opt_val" }),
      option_id,
      value,
    }));

    await tx.put(product.id, {
      ...product,
      options: product.options?.map((option) =>
        option.id === option_id ? { ...option, values: newValues } : option,
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
    const product = (await tx.get(variant.product_id)) as Product | undefined;
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
    { args, repositories }: UpdateProductVariantProps,
  ) => {
    const { variant_id, updates, product_id } = args;
    ProductVariantUpdatesSchema._parse(updates);
    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      throw new Error("Product not found");
    }
    if (!product.variants) {
      console.info(`Product  not found`);

      throw new Error("Product variants not found");
    }
    const product_variants = product.variants.map((variant) => {
      if (variant.id === variant_id) {
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
    if (product.collection_id) delete product.collection_id;
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
    const { customer_id, group_id } = args;
    string()._parse(customer_id);
    string()._parse(group_id);
    const customerGroup = (await tx.get(group_id)) as CustomerGroup | undefined;
    const customer = (await tx.get(customer_id)) as User | undefined;
    if (!customerGroup || !customer) {
      console.info(`Group/customer ${group_id} not found`);
      return;
    }
    customerGroup.customers.push(customer);

    await tx.put(group_id, customerGroup);
  },
  removeCustomerFromGroup: async (
    tx: WriteTransaction,
    { args }: RemoveCustomerFromGroupProps,
  ) => {
    const { customer_id, group_id } = args;
    string()._parse(customer_id);
    string()._parse(group_id);
    const customerGroup = (await tx.get(group_id)) as CustomerGroup | undefined;
    if (!customerGroup) {
      console.info(`Group/customer ${group_id} not found`);
      return;
    }
    const updated = {
      ...customerGroup,
      customers: customerGroup.customers.filter(
        (customer) => customer.id !== customer_id,
      ),
    };
    await tx.put(group_id, updated);
  },
  createPriceList: async (
    tx: WriteTransaction,
    { args }: CreatePriceListProps,
  ) => {
    const { price_list } = args;
    PriceListSchema._parse(price_list);
    await tx.put(price_list.id, price_list);
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
    const { price, price_list_id } = args;
    string()._parse(price_list_id);
    MoneyAmountSchema._parse(price);
    price.price_list_id = price_list_id;
    const priceList = (await tx.get(price_list_id)) as PriceList | undefined;
    if (!priceList) {
      console.info(`Price list ${price_list_id} not found`);
      return;
    }
    if (priceList.prices) priceList.prices.push(price);
    else priceList.prices = [price];
    await tx.put(price_list_id, priceList);
  },
  removeProductFromPriceList: async (
    tx: WriteTransaction,
    { args }: RemoveProductFromPriceListProps,
  ) => {
    const { price_id, price_list_id } = args;
    string()._parse(price_id);
    const priceList = (await tx.get(price_list_id)) as PriceList | undefined;
    if (!priceList) {
      console.info(`Price list ${price_id} not found`);
      return;
    }
    priceList.prices = priceList.prices
      ? priceList.prices.filter((price) => price.id !== price_id)
      : [];
    await tx.put(price_id, priceList);
  },
  createPrices: async (tx: WriteTransaction, { args }: CreatePricesProps) => {
    const { prices, product_id, variant_id } = args;
    array(MoneyAmountSchema)._parse(prices);
    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      console.info(`Product  not found`);
      return;
    }
    const variant = product.variants?.find(
      (variant) => variant.id === variant_id,
    );
    if (!variant) {
      console.log("variant not found");
      return;
    }
    const variant_prices = variant.prices ? [...variant.prices] : [];
    for (const price of prices) {
      variant_prices.push(price);
    }
    await tx.put(product.id, {
      ...product,
      variants: product.variants?.map((variant) =>
        variant.id === variant_id
          ? { ...variant, prices: [...variant_prices] }
          : variant,
      ),
    });
  },
  updatePrice: async (tx: WriteTransaction, { args }: UpdatePriceProps) => {
    const { money_amount_id, updates, variant_id, product_id } = args;

    string()._parse(money_amount_id);
    console.log("updates", updates);
    MoneyAmountUpdatesSchema._parse(updates);
    console.log("product_id", product_id);

    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      console.info(`Product  not found`);
      return;
    }
    const variant = product.variants?.find((val) => val.id === variant_id);
    if (!variant) {
      console.log("variant not found");
      return;
    }
    const variant_prices = variant.prices
      ? variant.prices.map((money_amount) => {
          if (money_amount.id === money_amount_id)
            return { ...money_amount, ...updates };
          return money_amount;
        })
      : [];

    await tx.put(product.id, {
      ...product,
      variants: product.variants?.map((variant_) =>
        variant_.id === variant_id
          ? { ...variant, prices: variant_prices }
          : variant_,
      ),
    });
  },
  deletePrices: async (tx: WriteTransaction, { args }: DeletePricesProps) => {
    const { ids, product_id, variant_id } = args;
    array(string())._parse(ids);
    string()._parse(product_id);
    string()._parse(variant_id);
    const product = (await tx.get(product_id)) as Product | undefined;
    if (!product) {
      console.info(`Product  not found`);
      return;
    }
    const variant = product.variants?.find((val) => val.id === variant_id);
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
        variant_.id === variant_id
          ? { ...variant, prices: variant_prices }
          : variant_,
      ),
    });
  },
};
