import { type PatchOperation } from "replicache";
import { z } from "zod";

import { type TableName } from "@pachi/db";

export const ClientViewRecordSchema = z.record(z.string(), z.number());
export type ClientViewRecord = Record<string, number>;
export type ClientViewRecordWTableName = {
  [K in TableName]?: ClientViewRecord;
};
export const SpaceIDSchema = z.enum(["global", "dashboard"] as const);
export type SpaceID = z.infer<typeof SpaceIDSchema>;
export const SPACE_RECORD = {
  global: ["user" as const],
  dashboard: ["store" as const],
};
export type SpaceRecord = typeof SPACE_RECORD;
export const mutationAffectedSpaces = {
  createProduct: {
    dashboard: ["store" as const],
  },
  updateProduct: {
    dashboard: ["store" as const],
  },
  deleteProduct: {
    dashboard: ["store" as const],
  },
  deleteProductVariant: {
    dashboard: ["store" as const],
  },
  publishProduct: {
    dashboard: ["store" as const],
    products: ["products" as const],
  },
  draftProduct: {
    dashboard: ["store" as const],
    products: ["products" as const],
  },
  createProductOption: {
    dashboard: ["store" as const],
  },
  updateProductOption: {
    dashboard: ["store" as const],
  },
  deleteProductOption: {
    dashboard: ["store" as const],
  },
  updateProductOptionValues: {
    dashboard: ["store" as const],
  },
  uploadProductImages: {
    dashboard: ["store" as const],
  },
  updateImagesOrder: {
    dashboard: ["store" as const],
  },
  createProductVariant: {
    dashboard: ["store" as const],
  },
  updateProductVariant: {
    dashboard: ["store" as const],
  },
  updatePrice: {
    dashboard: ["store" as const],
  },
  createStore: {
    global: ["user" as const],
  },
  createUser: {
    global: ["user" as const],
  },
  updateStore: {
    global: ["user" as const],
  },
  createPrices: {
    dashboard: ["store" as const],
  },
  deletePrices: {
    dashboard: ["store" as const],
  },
  assignProductOptionValueToVariant: {
    dashboard: ["store" as const],
  },
};
const mutationNames = [
  "createProduct",
  "updateProduct",
  "deleteProduct",
  "deleteProductVariant",
  "publishProduct",
  "draftProduct",
  "createProductOption",
  "updateProductOption",
  "deleteProductOption",
  "updateProductOptionValues",
  "uploadProductImages",
  "updateImagesOrder",
  "createProductVariant",
  "updateProductVariant",
  "updatePrice",
  "createStore",
  "createUser",
  "updateStore",
  "createPrices",
  "deletePrices",
  "assignProductOptionValueToVariant",
] as const;

export const MutationNamesSchema = z.enum(mutationNames);
export type Mutation = z.infer<typeof mutationSchema>;
export const mutationSchema = z.object({
  id: z.number(),
  name: MutationNamesSchema,
  args: z.any(),
  clientID: z.string(),
});
export const pushRequestSchema = z.object({
  clientGroupID: z.string(),
  mutations: z.array(mutationSchema),
});
export type PushRequest = z.infer<typeof pushRequestSchema>;
export type PullResponse = {
  cookie: string;
  lastMutationIDChanges: Record<string, number>;
  patch: PatchOperation[];
};
export const cookieSchema = z.object({
  productsSpaceRecordKey: z.optional(z.string()),
  globalSpaceRecordKey: z.optional(z.string()),
  dashboardSpaceRecordKey: z.optional(z.string()),
  clientRecordKey: z.optional(z.string()),
  order: z.number(),
});
export type Cookie = z.infer<typeof cookieSchema>;
export const pullRequestSchema = z.object({
  clientGroupID: z.string(),
  cookie: z.union([cookieSchema, z.null()]),
});
export type PullRequest = z.infer<typeof pullRequestSchema>;
export const RequestHeadersSchema = z.object({
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
});
export type RequestHeaders = z.infer<typeof RequestHeadersSchema>;
export const subspacesSchema = z
  .array(z.enum(["store", "user"] as const))
  .optional();
