import { useEffect, useRef } from "react";
import { useShiftsStore } from "../store/shiftsStore";
import {
  isSupabaseConfigured,
  syncAllShifts,
  getShiftsInRange,
  initializeUser,
} from "./supabase";

/**
 * Hook for syncing shifts between localStorage and Supabase
 * Syncs on mount and whenever shifts change
 */
export const useShiftsSync = () => {
  const shifts = useShiftsStore((state: any) => state.shifts);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>(
    undefined as any,
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log("📍 Supabase not configured, using localStorage only");
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
    if (!isSupabaseConfigured()) return;
    if (shifts.length === 0) return;

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
  }, [shifts]);
};

/**
 * Hook for loading shifts from Supabase
 */
export const useLoadShiftsFromSupabase = () => {
  const loadShifts = useShiftsStore((state: any) => state.loadShifts);

  const loadFromSupabase = async () => {
    if (!isSupabaseConfigured()) {
      console.log("📍 Supabase not configured, using localStorage only");
      loadShifts();
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
        // Update localStorage with Supabase data
        localStorage.setItem("courier-finance:shifts", JSON.stringify(shifts));
        loadShifts();
        console.log(`✅ Loaded ${shifts.length} shifts from Supabase`);
      } else {
        // Fall back to localStorage if no shifts in Supabase
        console.log("📍 No shifts in Supabase, using localStorage");
        loadShifts();
      }
    } catch (error) {
      console.error("❌ Failed to load shifts from Supabase:", error);
      console.log("📍 Falling back to localStorage");
      loadShifts(); // Fall back to localStorage
    }
  };

  return loadFromSupabase;
};
