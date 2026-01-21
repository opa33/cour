import { useEffect, useState } from "react";
import { ShiftCalculator, Statistics, Profile, Leaderboard } from "./screens";
import { useShiftsStore, useUserStore } from "./store";
import Tabs from "./components/Tabs";
import {
  useShiftsSync,
  useLoadShiftsFromSupabase,
} from "./utils/useShiftsSync";
import {
  useUserSettingsSync,
  useLoadUserSettingsFromSupabase,
} from "./utils/useUserSettingsSync";
import { initTelegram } from "./utils/telegram";

type TabId = "calculator" | "statistics" | "leaderboard" | "profile";

const tabs = [
  { id: "calculator", label: "Расчёт" },
  { id: "statistics", label: "Статистика" },
  { id: "leaderboard", label: "Рейтинг" },
  { id: "profile", label: "Профиль" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("calculator");
  const [isInitialized, setIsInitialized] = useState(false);
  const startNewShift = useShiftsStore((state: any) => state.startNewShift);
  const setShiftsInitialized = useShiftsStore(
    (state: any) => state.setInitialized,
  );
  const userSettings = useUserStore((state: any) => state.settings);

  // Load from Supabase
  const loadShiftsFromSupabase = useLoadShiftsFromSupabase();
  const loadUserSettingsFromSupabase = useLoadUserSettingsFromSupabase();

  // Sync hooks for auto-sync
  useShiftsSync();
  useUserSettingsSync();

  // Apply theme
  useEffect(() => {
    const applyTheme = () => {
      const preference = userSettings.themePreference;
      const htmlElement = document.documentElement;

      if (preference === "system") {
        // Follow system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        if (prefersDark) {
          htmlElement.classList.add("dark");
        } else {
          htmlElement.classList.remove("dark");
        }
      } else if (preference === "dark") {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
    };

    applyTheme();

    // Listen to system theme changes when preference is "system"
    if (userSettings.themePreference === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [userSettings.themePreference]);

  // Initialize app on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize Telegram WebApp
        const webApp = initTelegram();
        if (webApp) {
          console.log("✅ Telegram WebApp initialized");
        } else {
          console.warn("⚠️ Telegram WebApp not available (development mode)");
        }

        console.log("📥 Loading from Supabase...");
        await loadUserSettingsFromSupabase();
        await loadShiftsFromSupabase();

        // Mark as initialized so sync can start
        setShiftsInitialized(true);
      } catch (error) {
        console.error("❌ Initialization failed:", error);
        setShiftsInitialized(true);
      }

      startNewShift();
      setIsInitialized(true);
    };

    initialize();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return <ShiftCalculator />;
      case "statistics":
        return <Statistics />;
      case "leaderboard":
        return <Leaderboard />;
      case "profile":
        return <Profile />;
      default:
        return <ShiftCalculator />;
    }
  };

  // Wait for initialization before rendering
  if (!isInitialized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-sm">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 mb-4">Загрузка...</p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>📱 Приложение требует Telegram для авторизации</p>
            <p>Убедитесь, что используете его в Telegram Mini App</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex-1 overflow-y-auto pb-24">{renderContent()}</div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabId)}
      />
    </div>
  );
}
