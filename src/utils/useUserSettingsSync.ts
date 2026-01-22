import { useEffect, useRef } from "react";
import { useUserStore } from "../store/userStore";
import {
  isSupabaseConfigured,
  saveUserSettingsToSupabase,
  loadUserSettingsFromSupabase,
} from "./supabase";
import { getFirstName } from "./telegram";

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
  const updateSettings = useUserStore((state: any) => state.updateSettings);

  const loadFromSupabase = async () => {
    if (!isSupabaseConfigured()) {
      console.log("📍 Supabase not configured");
      // Set Telegram first name as default username even without Supabase
      const firstName = getFirstName();
      if (firstName) {
        updateSettings({ username: firstName });
      }
      return;
    }

    try {
      console.log("📥 Loading user settings from Supabase...");
      const supabaseSettings = await loadUserSettingsFromSupabase();

      if (supabaseSettings) {
        updateSettings(supabaseSettings);
        console.log("✅ Loaded user settings from Supabase");
      } else {
        console.log(
          "📍 No settings in Supabase, using defaults with Telegram name",
        );
        // Set Telegram first name as default username
        const firstName = getFirstName();
        if (firstName) {
          updateSettings({ username: firstName });
          console.log("📝 Set username to Telegram first name:", firstName);
        }
      }
    } catch (error) {
      console.error("❌ Failed to load user settings from Supabase:", error);
      // Fallback: set Telegram first name
      const firstName = getFirstName();
      if (firstName) {
        updateSettings({ username: firstName });
      }
    }
  };

  return loadFromSupabase;
};
