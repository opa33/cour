import { create } from "zustand";
import type { ShiftRecord, CurrentShift } from "./types";
import { getTodayDate } from "../utils";
import { saveShiftsToLocalStorage } from "../utils/localStorage";

interface ShiftsStore {
  shifts: ShiftRecord[];
  currentShift: CurrentShift | null;
  isInitialized: boolean;
  startNewShift: () => void;
  updateCurrentShift: (partial: Partial<CurrentShift>) => void;
  saveCurrentShift: () => void;
  resetCurrentShift: () => void;
  setShifts: (shifts: ShiftRecord[]) => void;
  saveShifts: () => void;
  setInitialized: (value: boolean) => void;
  deleteShift: (date: string) => void;
  getShiftByDate: (date: string) => ShiftRecord | undefined;
  getShiftsByPeriod: (startDate: string, endDate: string) => ShiftRecord[];
  getTotalEarningsByPeriod: (startDate: string, endDate: string) => number;
}

const EMPTY_SHIFT = (): CurrentShift => ({
  id: crypto.randomUUID(),
  date: getTodayDate(),
  minutes: 0,
  zone1: 0,
  zone2: 0,
  zone3: 0,
  kilometers: 0,
  fuelCost: 0,
  timeIncome: 0,
  ordersIncome: 0,
  totalWithTax: 0,
  totalWithoutTax: 0,
  netProfit: 0,
});

export const useShiftsStore = create<ShiftsStore>((set, get) => ({
  shifts: [],
  currentShift: EMPTY_SHIFT(),
  isInitialized: false,

  startNewShift: () => {
    set({ currentShift: EMPTY_SHIFT() });
  },

  updateCurrentShift: (partial: Partial<CurrentShift>) => {
    set((state: any) => ({
      currentShift: state.currentShift
        ? { ...state.currentShift, ...partial }
        : null,
    }));
  },

  saveCurrentShift: () => {
    const { shifts, currentShift } = get();
    if (!currentShift) return;

    const existingIndex = shifts.findIndex(
      (s: ShiftRecord) => s.date === currentShift.date,
    );
    let newShifts: ShiftRecord[];

    if (existingIndex >= 0) {
      newShifts = [...shifts];
      newShifts[existingIndex] = currentShift as ShiftRecord;
    } else {
      newShifts = [...shifts, currentShift as ShiftRecord];
    }

    set({ shifts: newShifts });
    saveShiftsToLocalStorage(newShifts);
  },

  resetCurrentShift: () => {
    set({ currentShift: EMPTY_SHIFT() });
  },

  setShifts: (shifts: ShiftRecord[]) => {
    set({ shifts });
    saveShiftsToLocalStorage(shifts);
  },

  saveShifts: () => {
    saveShiftsToLocalStorage(get().shifts);
  },

  setInitialized: (value: boolean) => {
    set({ isInitialized: value });
  },

  deleteShift: (date: string) => {
    const newShifts = get().shifts.filter((s: ShiftRecord) => s.date !== date);
    set({ shifts: newShifts });
    saveShiftsToLocalStorage(newShifts);
  },

  getShiftByDate: (date: string) => {
    return get().shifts.find((s: ShiftRecord) => s.date === date);
  },

  getShiftsByPeriod: (startDate: string, endDate: string) => {
    return get().shifts.filter(
      (s: ShiftRecord) => s.date >= startDate && s.date <= endDate,
    );
  },

  getTotalEarningsByPeriod: (startDate: string, endDate: string) => {
    return get()
      .getShiftsByPeriod(startDate, endDate)
      .reduce((sum: number, s: ShiftRecord) => sum + s.netProfit, 0);
  },
}));
