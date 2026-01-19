import { useEffect, useState } from "react";
import { ShiftCalculator, Statistics } from "./screens";
import { useUserStore, useShiftsStore } from "./store";
import Tabs from "./components/Tabs";

type TabId = "calculator" | "statistics" | "leaderboard" | "profile";

const tabs = [
  { id: "calculator", label: "Расчёт", icon: "🧮" },
  { id: "statistics", label: "Статистика", icon: "📊" },
  { id: "leaderboard", label: "Рейтинг", icon: "🏆" },
  { id: "profile", label: "Профиль", icon: "⚙️" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("calculator");
  const loadUserSettings = useUserStore((state: any) => state.loadSettings);
  const loadShifts = useShiftsStore((state: any) => state.loadShifts);
  const startNewShift = useShiftsStore((state: any) => state.startNewShift);

  // Initialize app on mount
  useEffect(() => {
    loadUserSettings();
    loadShifts();
    startNewShift();
  }, [loadUserSettings, loadShifts, startNewShift]);

  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return <ShiftCalculator />;
      case "statistics":
        return <Statistics />;
      case "leaderboard":
        return (
          <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                🏆 Рейтинг
              </h1>
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
                <p>Экран рейтинга (в разработке)</p>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                ⚙️ Профиль
              </h1>
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
                <p>Экран профиля (в разработке)</p>
              </div>
            </div>
          </div>
        );
      default:
        return <ShiftCalculator />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabId)}
      />
    </div>
  );
}
