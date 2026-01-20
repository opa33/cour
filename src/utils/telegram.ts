/**
 * Initialize Telegram WebApp and get user data
 */
export const initTelegram = () => {
  const w = window as any;
  if (typeof w !== "undefined" && w.Telegram?.WebApp) {
    w.Telegram.WebApp.ready();
    return w.Telegram.WebApp;
  }
  return null;
};

/**
 * Get current user Telegram ID (auto-auth)
 */
export const getUserId = (): string | null => {
  const w = window as any;

  // Try initDataUnsafe first (most reliable)
  if (w.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    const id = String(w.Telegram.WebApp.initDataUnsafe.user.id);
    console.log("✅ Got Telegram ID from initDataUnsafe:", id);
    return id;
  }

  // Fallback to initData if available
  if (w.Telegram?.WebApp?.initData) {
    try {
      const params = new URLSearchParams(w.Telegram.WebApp.initData);
      const userData = params.get("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) {
          const id = String(user.id);
          console.log("✅ Got Telegram ID from initData:", id);
          return id;
        }
      }
    } catch (error) {
      console.error("Failed to parse Telegram initData:", error);
    }
  }

  console.error(
    "❌ Telegram User ID not available - app must run inside Telegram Mini App",
  );
  return null;
};

/**
 * Get user's Telegram username
 */
export const getUsername = (): string | null => {
  const w = window as any;
  return w.Telegram?.WebApp?.initDataUnsafe?.user?.username || null;
};

/**
 * Get user's first name from Telegram
 */
export const getFirstName = (): string | null => {
  const w = window as any;
  return w.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || null;
};

/**
 * Get user's photo URL from Telegram
 */
export const getUserPhotoUrl = (): string | null => {
  const w = window as any;
  // Telegram provides photo_url in initDataUnsafe
  return w.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || null;
};

/**
 * Get full user data from Telegram
 */
export const getTelegramUser = () => {
  const w = window as any;
  return w.Telegram?.WebApp?.initDataUnsafe?.user || null;
};
