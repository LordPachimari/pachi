import { enableMapSet } from "immer";
import { create } from "zustand";

enableMapSet();

interface CommonState {
  featureFlags: Record<string, boolean>;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
  isFeatureEnabled: (flag: string) => boolean;
}

export const CommonStore = create<CommonState>((set, get) => ({
  featureFlags: {},
  setFeatureFlags: (flags) => {
    set({ featureFlags: flags });
  },
  isFeatureEnabled: (flag) => {
    return get().featureFlags[flag] ?? false;
  },
}));
