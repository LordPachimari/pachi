import { enableMapSet } from 'immer'
import type { Replicache } from 'replicache'
import { create } from 'zustand'

import type {
  ClientDashboardMutatorsType,
  ClientGlobalMutatorsType,
} from '@pachi/core'

enableMapSet()

interface ReplicacheState {
  globalRep: Replicache<ClientGlobalMutatorsType> | null
  setGlobalRep: (rep: Replicache<ClientGlobalMutatorsType> | null) => void
  dashboardRep: Replicache<ClientDashboardMutatorsType> | null
  setDashboardRep: (rep: Replicache<ClientDashboardMutatorsType> | null) => void
}

export const useReplicache = create<ReplicacheState>((set) => ({
  globalRep: null,
  setGlobalRep: (rep) => set({ globalRep: rep }),
  dashboardRep: null,
  setDashboardRep: (rep) => set({ dashboardRep: rep }),
}))
