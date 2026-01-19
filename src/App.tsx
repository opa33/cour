import { useEffect, useState } from "react";
import { ShiftCalculator, Statistics, Profile, Leaderboard } from "./screens";
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
        return <Leaderboard />;
      case "profile":
        return <Profile />;
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
