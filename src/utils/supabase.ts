import { createClient } from "@supabase/supabase-js";
import { getUserId } from "./telegram";
// TODO: Generate types with: npx supabase gen types typescript --project-id your-id > src/utils/database.types.ts
// For now, using any type
// import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log("🔍 Supabase URL configured:", !!supabaseUrl);
console.log("🔍 Supabase Key configured:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase credentials not configured. Sync disabled. See .env.example",
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

/**
 * Retry helper with exponential backoff
 */
const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 500,
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i)),
        );
      }
    }
  }
  throw lastError;
};

// Cache user ID to avoid repeated lookups
let cachedUserId: string | null = null;

/**
 * Get current user ID from Telegram WebApp (with caching)
 */
export const getCurrentUserId = (): string => {
  if (cachedUserId) {
    return cachedUserId;
  }

  const userId = getUserId();
  if (userId) {
    cachedUserId = userId;
    console.log("👤 User ID:", userId);
    return userId;
  }
  throw new Error("❌ Unable to get user ID from Telegram");
};

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Initialize user in database (called on first app launch)
 */
export const initializeUser = async (username?: string) => {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured");
    return null;
  }

  try {
    const userId = getCurrentUserId();
    console.log("👤 Initializing user with ID:", userId);

    const result = await retryAsync(async () => {
      const userDataToSync = {
        telegram_id: userId,
        username: username || `User_${userId.slice(0, 8)}`,
        created_at: new Date().toISOString(),
      };

      console.log("📤 Sending user data:", userDataToSync);

      const { data, error } = await supabase
        .from("users")
        .upsert(userDataToSync, { onConflict: "telegram_id" })
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("✅ User initialized:", data);
      return data;
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to initialize user:", error);
    return null;
  }
};

/**
 * Sync a single shift to Supabase
 */
export const syncShift = async (shift: any) => {
  if (!isSupabaseConfigured()) {
    console.log("📍 Supabase not configured, skipping sync");
    return null;
  }

  try {
    const userId = getCurrentUserId();
    console.log("🔄 Syncing single shift for user:", userId);

    const shiftData = {
      id: shift.id || crypto.randomUUID(),
      telegram_id: userId,
      date: shift.date,
      minutes: shift.minutes,
      zone1: shift.zone1,
      zone2: shift.zone2,
      zone3: shift.zone3,
      kilometers: shift.kilometers,
      fuelCost: shift.fuelCost,
      timeIncome: shift.timeIncome,
      ordersIncome: shift.ordersIncome,
      totalWithTax: shift.totalWithTax,
      totalWithoutTax: shift.totalWithoutTax,
      netProfit: shift.netProfit,
      updated_at: new Date().toISOString(),
    };

    console.log("📤 Sending shift data:", shiftData);

    const { data, error } = await supabase
      .from("shifts")
      .upsert(shiftData, { onConflict: "telegram_id,date" })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      throw error;
    }

    console.log("✅ Shift synced successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to sync shift:", error);
    return null;
  }
};

/**
 * Sync all shifts from localStorage to Supabase
 */
export const syncAllShifts = async (shifts: any[]) => {
  if (!isSupabaseConfigured()) return [];

  try {
    const userId = getCurrentUserId();
    console.log("🔄 Syncing shifts for user:", userId, "Count:", shifts.length);

    const result = await retryAsync(async () => {
      const shiftsToSync = shifts.map((shift) => ({
        id: shift.id || crypto.randomUUID(),
        telegram_id: userId,
        date: shift.date,
        ...shift,
        updated_at: new Date().toISOString(),
      }));

      console.log("📤 Sending shifts:", shiftsToSync.length);

      const { data, error } = await supabase
        .from("shifts")
        .upsert(shiftsToSync, { onConflict: "telegram_id,date" })
        .select();

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("✅ Shifts synced:", data?.length || 0);
      return data || [];
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to sync all shifts:", error);
    return [];
  }
};

/**
 * Load user settings from Supabase
 */
export const loadUserSettingsFromSupabase = async () => {
  if (!isSupabaseConfigured()) return null;

  const userId = getCurrentUserId();

  try {
    const result = await retryAsync(async () => {
      const { data, error } = await supabase
        .from("users")
        .select("settings")
        .eq("telegram_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return data?.settings || null;
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to load user settings:", error);
    return null;
  }
};

/**
 * Save user settings to Supabase
 */
export const saveUserSettingsToSupabase = async (settings: any) => {
  if (!isSupabaseConfigured()) return null;

  const userId = getCurrentUserId();

  try {
    const result = await retryAsync(async () => {
      const { data, error } = await supabase
        .from("users")
        .update({
          settings: settings,
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to save user settings:", error);
    return null;
  }
};

/**
 * Get shifts for a date range
 */
export const getShiftsInRange = async (startDate: string, endDate: string) => {
  if (!isSupabaseConfigured()) return [];

  const userId = getCurrentUserId();

  try {
    const result = await retryAsync(async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("telegram_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to get shifts:", error);
    return [];
  }
};

/**
 * Delete a shift
 */
export const deleteShift = async (date: string) => {
  if (!isSupabaseConfigured()) return false;

  const userId = getCurrentUserId();

  try {
    const result = await retryAsync(async () => {
      const { error } = await supabase
        .from("shifts")
        .delete()
        .eq("telegram_id", userId)
        .eq("date", date);

      if (error) throw error;
      return true;
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to delete shift:", error);
    return false;
  }
};

/**
 * Get leaderboard for a period (using direct SQL queries for reliability)
 */
export const getLeaderboard = async (
  startDate: string,
  endDate: string,
  limit: number = 5,
) => {
  if (!isSupabaseConfigured()) return [];

  try {
    const result = await retryAsync(async () => {
      // Get all shifts for the period
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("telegram_id, netProfit")
        .gte("date", startDate)
        .lte("date", endDate);

      if (shiftsError) throw shiftsError;
      if (!shiftsData || shiftsData.length === 0) return [];

      // Group by telegram_id and sum earnings
      const grouped: Record<string, number> = {};
      shiftsData.forEach((row: any) => {
        if (!grouped[row.telegram_id]) {
          grouped[row.telegram_id] = 0;
        }
        grouped[row.telegram_id] += row.netProfit;
      });

      // Get user info for all telegram_ids
      const telegramIds = Object.keys(grouped);
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("telegram_id, username, leaderboard_opt_in")
        .in("telegram_id", telegramIds);

      if (usersError) throw usersError;

      // Build leaderboard entries
      const leaderboard = (usersData || [])
        .filter((user: any) => user.leaderboard_opt_in) // Only include opt-in users
        .map((user: any) => ({
          rank: 0, // Will be assigned after sorting
          telegram_id: user.telegram_id,
          username: user.username || "Unknown",
          total_earnings: grouped[user.telegram_id] || 0,
        }));

      // Sort by earnings and assign ranks
      leaderboard.sort((a: any, b: any) => b.total_earnings - a.total_earnings);
      return leaderboard
        .slice(0, limit)
        .map((item: any, idx: number) => ({ ...item, rank: idx + 1 }));
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to get leaderboard:", error);
    return [];
  }
};

/**
 * Subscribe to real-time shift updates
 */
export const subscribeToShifts = (
  callback: (shifts: any[]) => void,
  onError?: (error: Error) => void,
) => {
  if (!isSupabaseConfigured()) return null;

  const userId = getCurrentUserId();

  const channel = supabase
    .channel(`shifts-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shifts",
        filter: `telegram_id=eq.${userId}`,
      },
      (payload) => {
        console.log("🔄 Shift update:", payload);
        // Fetch all shifts to maintain consistency
        getShiftsInRange("2020-01-01", "2099-12-31").then(callback);
      },
    )
    .subscribe((status, err) => {
      if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        onError?.(err || new Error("Channel error"));
      }
    });

  return channel;
};

/**
 * Unsubscribe from real-time updates
 */
export const unsubscribeFromShifts = async (channel: any) => {
  if (!channel) return;
  await supabase.removeChannel(channel);
};
/**
 * Test Supabase connection (for debugging)
 */
export const testSupabaseConnection = async () => {
  console.log("\n🧪 Testing Supabase Connection...");

  if (!isSupabaseConfigured()) {
    console.error("❌ Supabase not configured (missing URL or Key)");
    return false;
  }

  try {
    console.log("📡 Testing users table read access...");
    const { error: userError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (userError) {
      console.error("❌ Cannot read users table:", userError.message);
      return false;
    }
    console.log("✅ Users table accessible");

    console.log("📡 Testing shifts table read access...");
    const { error: shiftsError } = await supabase
      .from("shifts")
      .select("count")
      .limit(1);

    if (shiftsError) {
      console.error("❌ Cannot read shifts table:", shiftsError.message);
      return false;
    }
    console.log("✅ Shifts table accessible");

    // Try to get current user ID
    try {
      const userId = getCurrentUserId();
      console.log("✅ Telegram User ID:", userId);
    } catch {
      console.warn(
        "⚠️ Cannot get Telegram User ID (might be in browser, not in Mini App)",
      );
    }

    console.log("✅ All tests passed! Connection is working.");
    return true;
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return false;
  }
};

/**
 * Get diagnostic info (for debugging)
 */
export const getDiagnosticInfo = () => {
  return {
    supabaseConfigured: isSupabaseConfigured(),
    supabaseUrl: supabaseUrl ? "✅ Set" : "❌ Missing",
    supabaseKey: supabaseAnonKey ? "✅ Set" : "❌ Missing",
    telegramWebApp:
      typeof window !== "undefined" && !!(window as any).Telegram?.WebApp
        ? "✅ Available"
        : "❌ Not available",
    userIdAvailable: (() => {
      try {
        getCurrentUserId();
        return "✅ Available";
      } catch {
        return "❌ Not available";
      }
    })(),
  };
};
