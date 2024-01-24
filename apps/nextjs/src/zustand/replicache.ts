import { enableMapSet } from "immer";
import type { Replicache } from "replicache";
import { create } from "zustand";

import type { DashboardMutators } from "~/providers/replicache/dashboard";
import type { GlobalMutators } from "~/providers/replicache/global";

enableMapSet();

interface ReplicacheState {
  globalRep: Replicache<GlobalMutators> | null;
  setGlobalRep: (rep: Replicache<GlobalMutators> | null) => void;
  dashboardRep: Replicache<DashboardMutators> | null;
  setDashboardRep: (rep: Replicache<DashboardMutators> | null) => void;
}

export const ReplicacheInstancesStore = create<ReplicacheState>((set) => ({
  globalRep: null,
  setGlobalRep: (rep) => set({ globalRep: rep }),
  dashboardRep: null,
  setDashboardRep: (rep) => set({ dashboardRep: rep }),
}));
