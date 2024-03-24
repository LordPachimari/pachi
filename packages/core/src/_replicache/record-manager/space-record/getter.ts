import type { SpaceID, SpaceRecord } from "@pachi/validators";

import { storeCVD } from "./dashboard";
import { userCVD } from "./global";
import type { GetRowsWTableName } from "./types";

export type SpaceRecordGetterType = {
  [K in SpaceID]: Record<SpaceRecord[K][number], GetRowsWTableName>;
};
export const SpaceRecordGetter: SpaceRecordGetterType = {
  dashboard: {
    store: storeCVD,
  },
  global: {
    user: userCVD,
  },
};
