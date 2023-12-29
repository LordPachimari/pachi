import type { PatchOperation } from "replicache";
import {
  any,
  array,
  enumType,
  keyof,
  nullable,
  nullType,
  number,
  object,
  optional,
  record,
  string,
  union,
  type Output,
} from "valibot";

import type { TableName } from "@pachi/db";

type Literal = boolean | null | number | string;
export const ClientViewDataSchema = record(string(), number());
export type ClientViewData = ({ id: string; version: number } & Record<
  string,
  unknown
>)[];
export type ClientViewDataWithTable = {
  tableName: TableName;
  cvd: ({ id: string; version: number } & Record<string, unknown>)[];
}[];

// export const SpaceId = enumType(["user", "product", "dashboard"] as const);
export const SubspacesIds = {
  global: ["user"] as const,
  products: ["products"] as const,
  dashboard: ["store"] as const,
};
export const SpaceRecordsSchema = object({
  global: optional(
    object({
      user: ClientViewDataSchema,
    }),
  ),
  dashboard: optional(
    object({
      store: ClientViewDataSchema,
    }),
  ),
  products: optional(
    object({
      products: ClientViewDataSchema,
    }),
  ),
});
export type SpaceRecords = Output<typeof SpaceRecordsSchema>;

export const SpaceIdSchema = keyof(SpaceRecordsSchema);

export type SpaceId = Output<typeof SpaceIdSchema>;
export type SpaceRecord<K extends SpaceId> = SpaceRecords[K];
export type SubspaceIds<K extends SpaceId> = keyof SpaceRecord<K>;

export const mutationNames = [
  "createProduct",
  "updateProduct",
  "publishProduct",
  "deleteProduct",
] as const;

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

export const MutationNamesSchema = enumType(mutationNames);

export type Mutation = Output<typeof mutationSchema>;

export const mutationSchema = object({
  id: number(),
  name: MutationNamesSchema,
  args: object({ args: record(string(), any()) }),
  clientID: string(),
});

export const pushRequestSchema = object({
  clientGroupID: string(),
  mutations: array(mutationSchema),
});

export const ClientGroupObjectSchema = object({
  id: string(),
  spaceRecordVersion: number(),
  clientVersion: number(),
});

export type ClientGroupObject = Output<typeof ClientGroupObjectSchema>;

export type PushRequest = Output<typeof pushRequestSchema>;

export type PullResponse = {
  cookie: string;
  lastMutationIDChanges: Record<string, number>;
  patch: PatchOperation[];
};

export const cookieSchema = object({
  productsSpaceRecordKey: optional(string()),
  globalSpaceRecordKey: optional(string()),
  dashboardSpaceRecordKey: optional(string()),
  order: number(),
});

export type Cookie = Output<typeof cookieSchema>;

export const pullRequestSchema = object({
  clientGroupID: string(),
  cookie: union([cookieSchema, nullType()]),
});

export type PullRequest = Output<typeof pullRequestSchema>;

export const RequestHeadersSchema = object({
  ip: nullable(string()),
  userAgent: nullable(string()),
});
export type RequestHeaders = Output<typeof RequestHeadersSchema>;
