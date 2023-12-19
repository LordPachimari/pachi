import { enableMapSet } from "immer";
import type { Replicache } from "replicache";
import { create } from "zustand";

import type {
  DashboardMutators,
  GlobalMutators,
  ProductsMutators,
} from "@pachi/api";

enableMapSet();

interface ReplicacheState {
  productsRep: Replicache<ProductsMutators> | null;
  setProductsRep: (rep: Replicache<ProductsMutators> | null) => void;
  globalRep: Replicache<GlobalMutators> | null;
  setGlobalRep: (rep: Replicache<GlobalMutators> | null) => void;
  dashboardRep: Replicache<DashboardMutators> | null;
  setDashboardRep: (rep: Replicache<DashboardMutators> | null) => void;
}

export const ReplicacheInstancesStore = create<ReplicacheState>((set) => ({
  productsRep: null,
  setProductsRep: (rep) => set({ productsRep: rep }),
  globalRep: null,
  setGlobalRep: (rep) => set({ globalRep: rep }),
  dashboardRep: null,
  setDashboardRep: (rep) => set({ dashboardRep: rep }),
}));
