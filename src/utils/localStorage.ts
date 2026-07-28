import type { ShiftRecord, UserSettings } from "../store/types";

const SHIFTS_KEY = "courier-finance:shifts";
const USER_SETTINGS_KEY = "courier-finance:user-settings";

export const loadShiftsFromLocalStorage = (): ShiftRecord[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(SHIFTS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as ShiftRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error("❌ Failed to load shifts from localStorage:", error);
    return [];
  }
};

export const saveShiftsToLocalStorage = (shifts: ShiftRecord[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
  } catch (error) {
    console.error("❌ Failed to save shifts to localStorage:", error);
  }
};

export const loadUserSettingsFromLocalStorage = (): UserSettings | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(USER_SETTINGS_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as UserSettings;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    console.error("❌ Failed to load user settings from localStorage:", error);
    return null;
  }
};

export const saveUserSettingsToLocalStorage = (settings: UserSettings) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("❌ Failed to save user settings to localStorage:", error);
  }
};
