/**
 * Initialize Telegram WebApp and get user data
 */
export const initTelegram = () => {
  const w = window as any;
  if (typeof w !== "undefined" && w.Telegram?.WebApp) {
    const webApp = w.Telegram.WebApp;
    webApp.ready();
    webApp.expand(); // Expand to full available height

    // Update CSS variables for safe area insets
    const updateSafeArea = () => {
      const root = document.documentElement;
      const insets = webApp.safeAreaInset || {};
      root.style.setProperty("--safe-area-top", `${insets.top || 0}px`);
      root.style.setProperty("--safe-area-bottom", `${insets.bottom || 0}px`);
      root.style.setProperty("--safe-area-left", `${insets.left || 0}px`);
      root.style.setProperty("--safe-area-right", `${insets.right || 0}px`);
    };

    updateSafeArea();
    webApp.onEvent("safeAreaChanged", updateSafeArea);

    return webApp;
  }
  return null;
};

/**
 * MainButton helpers
 */
export const setMainButtonText = (text: string) => {
  const w = window as any;
  if (w.Telegram?.WebApp?.MainButton?.setText) {
    try {
      w.Telegram.WebApp.MainButton.setText(text);
    } catch (e) {
      console.error("Failed to set MainButton text:", e);
    }
  }
};

export const showMainButton = (enabled = true) => {
  const w = window as any;
  try {
    if (w.Telegram?.WebApp?.MainButton) {
      w.Telegram.WebApp.MainButton.show();
      if (enabled && w.Telegram.WebApp.MainButton.enable) {
        w.Telegram.WebApp.MainButton.enable();
      }
    }
  } catch (e) {
    console.error("Failed to show MainButton:", e);
  }
};

export const hideMainButton = () => {
  const w = window as any;
  try {
    if (w.Telegram?.WebApp?.MainButton) {
      w.Telegram.WebApp.MainButton.hide();
    }
  } catch (e) {
    console.error("Failed to hide MainButton:", e);
  }
};

export const onMainButtonClick = (cb: () => void) => {
  const w = window as any;
  if (w.Telegram?.WebApp?.MainButton?.onClick) {
    try {
      w.Telegram.WebApp.MainButton.onClick(cb);
      return () => {
        try {
          if (w.Telegram.WebApp.MainButton.offClick) {
            w.Telegram.WebApp.MainButton.offClick(cb);
          }
        } catch (e) {
          // offClick may not exist
        }
      };
    } catch (e) {
      console.error("Failed to register MainButton click:", e);
    }
  }
  return () => {};
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
