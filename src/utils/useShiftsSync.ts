import { useEffect, useRef } from "react";
import { useShiftsStore } from "../store/shiftsStore";
import {
  isSupabaseConfigured,
  syncAllShifts,
  getShiftsInRange,
  initializeUser,
} from "./supabase";
import {
  saveShiftsToLocalStorage,
  loadShiftsFromLocalStorage,
} from "./localStorage";

/**
 * Hook for syncing shifts between localStorage and Supabase
 * Syncs on mount and whenever shifts change
 */
export const useShiftsSync = () => {
  const shifts = useShiftsStore((state) => state.shifts);
  const isInitialized = useShiftsStore((state) => state.isInitialized);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>(
    undefined as any,
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log("📍 Supabase not configured, using data only");
      return;
    }

    // Initialize user on first sync
    const initUser = async () => {
      try {
        await initializeUser();
        console.log("✅ User initialized in Supabase");
      } catch (error) {
        console.error("❌ Failed to initialize user in Supabase:", error);
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    saveShiftsToLocalStorage(shifts);

    if (!isSupabaseConfigured()) return;
    if (!isInitialized) return; // Don't sync until data is loaded

    // Debounce sync to avoid too many requests
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("🔄 Syncing shifts to Supabase...", shifts.length);
        await syncAllShifts(shifts);
        console.log("✅ Shifts synced successfully");
      } catch (error) {
        console.error("❌ Failed to sync shifts:", error);
      }
    }, 2000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [shifts, isInitialized]);
};

/**
 * Hook for loading shifts from Supabase
 */
export const useLoadShiftsFromSupabase = () => {
  const setShifts = useShiftsStore((state: any) => state.setShifts);

  const loadFromSupabase = async () => {
    const localShifts = loadShiftsFromLocalStorage();
    if (localShifts.length > 0) {
      setShifts(localShifts);
      console.log(`📥 Loaded ${localShifts.length} shifts from localStorage`);
    }

    if (!isSupabaseConfigured()) {
      console.log("📍 Supabase not configured");
      return;
    }

    try {
      const today = new Date();
      const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - 6));

      const startDate = sixMonthsAgo.toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      console.log("📥 Loading shifts from Supabase...");
      const shifts = await getShiftsInRange(startDate, endDate);

      if (shifts.length > 0) {
        setShifts(shifts);
        console.log(`✅ Loaded ${shifts.length} shifts from Supabase`);
      } else {
        console.log("📍 No shifts in Supabase");
      }
    } catch (error) {
      console.error("❌ Failed to load shifts from Supabase:", error);
    }
  };

  return loadFromSupabase;
};
