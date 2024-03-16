import type { SpaceID, SpaceRecord } from "../../schema-and-types";
import { storeCVD } from "./dashboard";
import { userCVD } from "./global";
import type { GetClientViewRecordWTableName } from "./types";

export type SpaceRecordGetterType = {
  [K in SpaceID]: Record<SpaceRecord[K][number], GetClientViewRecordWTableName>;
};
export const SpaceRecordGetter: SpaceRecordGetterType = {
  dashboard: {
    store: storeCVD,
  },
  global: {
    user: userCVD,
  },
};
