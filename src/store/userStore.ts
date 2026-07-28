import { create } from "zustand";
import type { UserSettings } from "./types";
import { getFirstName } from "../utils/telegram";
import { saveUserSettingsToLocalStorage } from "../utils/localStorage";

const DEFAULT_SETTINGS: UserSettings = {
  username: getFirstName() || "Курьер",
  ratePerMinute: 0.54,
  priceZone1: 196,
  priceZone2: 212,
  priceZone3: 239,
  taxCoefficient: 0.9364,
  currency: "₽",
  fuelTrackingEnabled: false,
  leaderboardOptIn: false,
  earningsGoal: 10000,
};

interface UserStore {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (partial: Partial<UserSettings>) => {
    set((state: any) => {
      const updatedSettings = { ...state.settings, ...partial };
      saveUserSettingsToLocalStorage(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  resetSettings: () => {
    saveUserSettingsToLocalStorage(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },
}));
