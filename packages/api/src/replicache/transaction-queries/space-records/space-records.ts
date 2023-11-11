import type { SpaceId, SubspaceIds } from "@pachi/types";

import type { GetClientViewData } from "../types";
import { storeCVD } from "./dashboard/store";
import { userCVD } from "./global";
import { productsCVD } from "./products";

export type SpaceRecordGetterType = Record<
  SpaceId,
  Record<SubspaceIds<SpaceId>, GetClientViewData>
>;

export const SpaceRecordGetter: SpaceRecordGetterType = {
  global: {
    user: userCVD,
  },
  products: {
    products: productsCVD,
  },
  dashboard: {
    store: storeCVD,
  },
};
