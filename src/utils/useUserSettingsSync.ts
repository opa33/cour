import { useEffect, useRef } from "react";
import { useUserStore } from "../store/userStore";
import {
  isSupabaseConfigured,
  saveUserSettingsToSupabase,
  loadUserSettingsFromSupabase,
} from "./supabase";

/**
 * Hook for syncing user settings between localStorage and Supabase
 */
export const useUserSettingsSync = () => {
  const settings = useUserStore((state: any) => state.settings);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>(
    undefined as any,
  );

  // Sync to Supabase when settings change
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Debounce sync to avoid too many requests
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("🔄 Syncing user settings to Supabase...");
        await saveUserSettingsToSupabase(settings);
        console.log("✅ Settings synced successfully");
      } catch (error) {
        console.error("❌ Failed to sync user settings:", error);
      }
    }, 2000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [settings]);
};

/**
 * Hook for loading user settings from Supabase
 */
export const useLoadUserSettingsFromSupabase = () => {
  const loadSettings = useUserStore((state: any) => state.loadSettings);
  const updateSettings = useUserStore((state: any) => state.updateSettings);

  const loadFromSupabase = async () => {
    if (!isSupabaseConfigured()) {
      console.log("📍 Supabase not configured, using localStorage only");
      loadSettings();
      return;
    }

    try {
      console.log("📥 Loading user settings from Supabase...");
      const supabaseSettings = await loadUserSettingsFromSupabase();

      if (supabaseSettings) {
        updateSettings(supabaseSettings);
        console.log("✅ Loaded user settings from Supabase");
      } else {
        // Fall back to localStorage
        console.log("📍 No settings in Supabase, using localStorage");
        loadSettings();
      }
    } catch (error) {
      console.error("❌ Failed to load user settings from Supabase:", error);
      console.log("📍 Falling back to localStorage");
      loadSettings(); // Fall back to localStorage
    }
  };

  return loadFromSupabase;
};
