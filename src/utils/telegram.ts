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
  const webApp = initTelegram();
  if (webApp?.initDataUnsafe?.user?.id) {
    return String(webApp.initDataUnsafe.user.id);
  }
  // Fallback for development
  return "dev-" + Math.random().toString(36).substr(2, 9);
};

/**
 * Get user's Telegram username
 */
export const getUsername = (): string | null => {
  const webApp = initTelegram();
  return webApp?.initDataUnsafe?.user?.username || null;
};
