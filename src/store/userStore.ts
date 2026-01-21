import { create } from "zustand";
import type { UserSettings } from "./types";

const DEFAULT_SETTINGS: UserSettings = {
  username: "",
  ratePerMinute: 0.54,
  priceZone1: 196,
  priceZone2: 212,
  priceZone3: 239,
  taxCoefficient: 0.9364,
  currency: "₽",
  fuelTrackingEnabled: false,
  leaderboardOptIn: false,
  earningsGoal: 10000,
  themePreference: "system",
};

interface UserStore {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (partial: Partial<UserSettings>) => {
    set((state: any) => ({
      settings: { ...state.settings, ...partial },
    }));
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
  },
}));
