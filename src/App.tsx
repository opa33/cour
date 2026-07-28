import { useEffect, useState } from "react";
import {
  ShiftCalculator,
  Statistics,
  Profile,
  Leaderboard,
  Admin,
} from "./screens";
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

type TabId = "calculator" | "statistics" | "leaderboard" | "profile" | "admin";

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
        return (
          <Profile
            onAdminAccess={() => {
              console.log("🔐 Admin access granted!");
              setActiveTab("admin");
            }}
          />
        );
      case "admin":
        return <Admin />;
      default:
        return <ShiftCalculator />;
    }
  };

  // Wait for initialization before rendering
  if (!isInitialized) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4 pt-safe pb-safe">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-8 h-8"
                  fill="currentColor"
                >
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5h-2v-2h2v2zm0-4.5h-2V6h2v6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Courier Finance
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Мобильный кабинет курьера — рассчитывайте и сохраняйте смены
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Подготовка данных, синхронизация профиля и смен...
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse delay-75" />
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse delay-150" />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-emerald-600">✔</div>
                  <div>
                    <div className="font-medium text-slate-900">Телеграм</div>
                    <div className="text-xs text-slate-500">
                      Проверка авторизации
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-center text-slate-400 mt-2">
                Приложение работает внутри Telegram Mini App. Если загрузка
                длится дольше минуты — перезапустите чат.
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
