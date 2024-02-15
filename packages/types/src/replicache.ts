import { type PatchOperation } from "replicache";
import { z } from "zod";

import type { TableName } from "@pachi/db";

type Literal = boolean | null | number | string;
export type ClientViewDataWithTable = {
  tableName: TableName;
  cvd: ClientViewData[];
};

export const ClientViewDataSchema = z
  .record(z.string(), z.unknown())
  .and(z.object({ id: z.string(), version: z.number() }));

export type ClientViewData = z.infer<typeof ClientViewDataSchema>;

export const RecordDataSchema = z.record(z.string(), z.number());
export const SpaceRecordsSchema = z.object({
  global: z.object({
    user: RecordDataSchema,
  }),
  dashboard: z.object({
    store: RecordDataSchema,
  }),
});
export type SpaceRecords = z.infer<typeof SpaceRecordsSchema>;
export const SpaceIdSchema = SpaceRecordsSchema.keyof();
export type SpaceId = z.infer<typeof SpaceIdSchema>;

export const spaceRecords: SpaceRecords = {
  global: {
    user: {},
  },
  dashboard: {
    store: {},
  },
};

export const mutationAffectedSpaces = {
  createProduct: {
    dashboard: ["store"] as const,
  },
  updateProduct: {
    dashboard: ["store"] as const,
  },
  deleteProduct: {
    dashboard: ["store"] as const,
  },
  deleteProductVariant: {
    dashboard: ["store"] as const,
  },
  publishProduct: {
    dashboard: ["store"] as const,
    products: ["products"] as const,
  },
  draftProduct: {
    dashboard: ["store"] as const,
    products: ["products"] as const,
  },
  createProductOption: {
    dashboard: ["store"] as const,
  },
  updateProductOption: {
    dashboard: ["store"] as const,
  },
  deleteProductOption: {
    dashboard: ["store"] as const,
  },
  updateProductOptionValues: {
    dashboard: ["store"] as const,
  },
  uploadProductImages: {
    dashboard: ["store"] as const,
  },
  updateImagesOrder: {
    dashboard: ["store"] as const,
  },
  createProductVariant: {
    dashboard: ["store"] as const,
  },
  updateProductVariant: {
    dashboard: ["store"] as const,
  },
  updatePrice: {
    dashboard: ["store"] as const,
  },
  createStore: {
    global: ["user"] as const,
  },
  createUser: {
    global: ["user"] as const,
  },
  updateStore: {
    global: ["user"] as const,
  },
  createPrices: {
    dashboard: ["store"] as const,
  },
  deletePrices: {
    dashboard: ["store"] as const,
  },
  assignProductOptionValueToVariant: {
    dashboard: ["store"] as const,
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

export const ClientGroupObjectSchema = z.object({
  id: z.string(),
  spaceRecordVersion: z.number(),
  clientVersion: z.number(),
});

export type ClientGroupObject = z.infer<typeof ClientGroupObjectSchema>;

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
