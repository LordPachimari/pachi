import { enableMapSet } from "immer";
import type { Replicache } from "replicache";
import { create } from "zustand";

import type { DashboardMutatorsType, GlobalMutatorsType } from "@pachi/core";

enableMapSet();

interface ReplicacheState {
  globalRep: Replicache<GlobalMutatorsType> | null;
  setGlobalRep: (rep: Replicache<GlobalMutatorsType> | null) => void;
  dashboardRep: Replicache<DashboardMutatorsType> | null;
  setDashboardRep: (rep: Replicache<DashboardMutatorsType> | null) => void;
}

export const useReplicache = create<ReplicacheState>((set) => ({
  globalRep: null,
  setGlobalRep: (rep) => set({ globalRep: rep }),
  dashboardRep: null,
  setDashboardRep: (rep) => set({ dashboardRep: rep }),
}));
