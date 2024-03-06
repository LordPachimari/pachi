import type { SpaceId, SpaceRecords } from '@pachi/types'

import { storeCVD } from './dashboard'
import { userCVD } from './global'
import type { GetClientViewDataWithTable } from './types'

export type SpaceRecordGetterType = {
  [K in SpaceId]: Record<keyof SpaceRecords[K], GetClientViewDataWithTable>
}
export const SpaceRecordGetter: SpaceRecordGetterType = {
  dashboard: {
    store: storeCVD,
  },
  global: {
    user: userCVD,
  },
}
