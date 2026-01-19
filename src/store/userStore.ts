import { create } from "zustand";
import type { UserSettings } from "./types";

const DEFAULT_SETTINGS: UserSettings = {
  ratePerMinute: 0.54,
  priceZone1: 196,
  priceZone2: 212,
  priceZone3: 239,
  taxCoefficient: 0.9364,
  currency: "₽",
  fuelTrackingEnabled: true,
  leaderboardOptIn: false,
  earningsGoal: 10000,
};

interface UserStore {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  loadSettings: () => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (partial: Partial<UserSettings>) => {
    set((state: any) => ({
      settings: { ...state.settings, ...partial },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  loadSettings: () => {
    try {
      const stored = localStorage.getItem("courier-finance:user-settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
      }
    } catch (error) {
      console.error("Failed to load user settings:", error);
    }
  },

  saveSettings: () => {
    try {
      localStorage.setItem(
        "courier-finance:user-settings",
        JSON.stringify(get().settings),
      );
    } catch (error) {
      console.error("Failed to save user settings:", error);
    }
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    localStorage.removeItem("courier-finance:user-settings");
  },
}));
