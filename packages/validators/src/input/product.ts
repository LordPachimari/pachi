import { z } from "zod";

import { ImageSchema } from "../common/image";
import {
  PriceSchema,
  ProductOptionSchema,
  ProductOptionValueSchema,
  ProductSchema,
  ProductVariantSchema,
} from "../server";

export const CreateProductSchema = z.object({
  product: ProductSchema,
  prices: z.array(PriceSchema),
});
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export const DeleteInputSchema = z.object({
  id: z.string(),
});
export type DeleteInput = z.infer<typeof DeleteInputSchema>;

const ProductUpdatesSchema = ProductSchema.pick({
  title: true,
  description: true,
  discountable: true,
  status: true,
  type: true,
});

export const UpdateProductSchema = z.object({
  updates: ProductUpdatesSchema,
  id: z.string(),
});
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export const UpdateProductImagesOrderSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  order: z.record(z.number()),
});
export type UpdateProductImagesOrder = z.infer<
  typeof UpdateProductImagesOrderSchema
>;
export const UploadProductImagesSchema = z.object({
  variantId: z.string(),
  images: z.array(ImageSchema),
  productId: z.string(),
});
export type UploadProductImages = z.infer<typeof UploadProductImagesSchema>;
export const CreateProductOptionSchema = z.object({
  option: ProductOptionSchema,
});
export type CreateProductOption = z.infer<typeof CreateProductOptionSchema>;
export const UpdateProductOptionSchema = z.object({
  updates: ProductOptionSchema.pick({ name: true }),
  optionId: z.string(),
  productId: z.string(),
});
export type UpdateProductOption = z.infer<typeof UpdateProductOptionSchema>;
export const DeleteProductOptionSchema = z.object({
  optionId: z.string(),
  productId: z.string(),
});
export type DeleteProductOption = z.infer<typeof DeleteProductOptionSchema>;
export const UpdateProductOptionValuesSchema = z.object({
  productId: z.string(),
  optionId: z.string(),
  newOptionValues: z.array(ProductOptionValueSchema),
});
export type UpdateProductOptionValues = z.infer<
  typeof UpdateProductOptionValuesSchema
>;
export const DeleteProductOptionValueSchema = z.object({
  optionValueId: z.string(),
  productId: z.string(),
});
export type DeleteProductOptionValue = z.infer<
  typeof DeleteProductOptionValueSchema
>;
export const CreateProductVariantSchema = z.object({
  variant: ProductVariantSchema,
});
export type CreateProductVariant = z.infer<typeof CreateProductVariantSchema>;
const ProductVariantUpdatesSchema = ProductVariantSchema.pick({
  title: true,
  barcode: true,
  ean: true,
  height: true,
  hsCode: true,
  quantity: true,
  metadata: true,
  material: true,
  midCode: true,
  sku: true,
  weight: true,
  width: true,
  upc: true,
  allowBackorder: true,
  length: true,
  originCountry: true,
});

export const UpdateProductVariantSchema = z.object({
  variantId: z.string(),
  productId: z.string(),
  updates: ProductVariantUpdatesSchema,
});
export type UpdateProductVariant = z.infer<typeof UpdateProductVariantSchema>;
export const DeleteProductVariantSchema = z.object({
  variantId: z.string(),
  productId: z.string(),
});
export type DeleteProductVariant = z.infer<typeof DeleteProductVariantSchema>;
export const CreateProductPricesSchema = z.object({
  prices: z.array(PriceSchema),
  productId: z.string(),
  variantId: z.string(),
});
export type CreateProductPrices = z.infer<typeof CreateProductPricesSchema>;
export const UpdateProductPriceSchema = z.object({
  priceId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  updates: PriceSchema.pick({ amount: true }),
});
export type UpdateProductPrice = z.infer<typeof UpdateProductPriceSchema>;
export const DeleteProductPricesSchema = z.object({
  priceIds: z.array(z.string()),
  productId: z.string(),
  variantId: z.string(),
});
export type DeleteProductPrices = z.infer<typeof DeleteProductPricesSchema>;
export const AssignProductOptionValueToVariantSchema = z.object({
  optionValueId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  prevOptionValueId: z.string().optional(),
});
export type AssignProductOptionValueToVariant = z.infer<
  typeof AssignProductOptionValueToVariantSchema
>;