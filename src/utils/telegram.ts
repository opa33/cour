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

  // Try initDataUnsafe first (more reliable for development)
  if (w.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    const id = String(w.Telegram.WebApp.initDataUnsafe.user.id);
    return id;
  }

  // Fallback to initData if available
  if (w.Telegram?.WebApp?.initData) {
    // Parse initData to extract user ID
    try {
      const params = new URLSearchParams(w.Telegram.WebApp.initData);
      const userData = params.get("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) {
          return String(user.id);
        }
      }
    } catch (error) {
      console.error("Failed to parse Telegram initData:", error);
    }
  }

  return null;
};

/**
 * Get user's Telegram username
 */
export const getUsername = (): string | null => {
  const webApp = initTelegram();
  return webApp?.initDataUnsafe?.user?.username || null;
};
