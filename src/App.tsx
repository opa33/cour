import { useEffect, useState } from "react";
import { ShiftCalculator, Statistics, Profile, Leaderboard } from "./screens";
import { useShiftsStore } from "./store";
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

  // Load from Supabase
  const loadShiftsFromSupabase = useLoadShiftsFromSupabase();
  const loadUserSettingsFromSupabase = useLoadUserSettingsFromSupabase();

  // Sync hooks for auto-sync
  useShiftsSync();
  useUserSettingsSync();

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
      <div className="w-full h-full min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600"
                  style={{
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <style>{`
                  @keyframes spin {
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Загрузка приложения
              </h2>
              <p className="text-sm text-gray-600">Пожалуйста, подождите...</p>
            </div>

            <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Требуется Telegram:</span>{" "}
                  приложение работает только внутри Telegram Mini App
                </p>
              </div>

              <div className="flex items-start gap-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Требуется VPN:</span>
                  подключитесь к VPN для доступа
                </p>
              </div>
            </div>
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
