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
import { syncAllShifts, isSupabaseConfigured } from "./utils/supabase";

type TabId = "calculator" | "statistics" | "leaderboard" | "profile";

const tabs = [
  { id: "calculator", label: "Расчёт", icon: "🧮" },
  { id: "statistics", label: "Статистика", icon: "📊" },
  { id: "leaderboard", label: "Рейтинг", icon: "🏆" },
  { id: "profile", label: "Профиль", icon: "⚙️" },
];

// Demo data for testing
const DEMO_SHIFTS = [
  {
    date: "2026-01-15",
    minutes: 480,
    zone1: 5,
    zone2: 3,
    zone3: 2,
    kilometers: 82,
    fuelCost: 1000,
    totalWithTax: 3500,
    totalWithoutTax: 3045,
    netProfit: 2045,
  },
  {
    date: "2026-01-16",
    minutes: 540,
    zone1: 7,
    zone2: 4,
    zone3: 1,
    kilometers: 95,
    fuelCost: 1100,
    totalWithTax: 4200,
    totalWithoutTax: 3656,
    netProfit: 2556,
  },
  {
    date: "2026-01-17",
    minutes: 420,
    zone1: 4,
    zone2: 2,
    zone3: 3,
    kilometers: 68,
    fuelCost: 900,
    totalWithTax: 2800,
    totalWithoutTax: 2436,
    netProfit: 1536,
  },
  {
    date: "2026-01-18",
    minutes: 600,
    zone1: 8,
    zone2: 5,
    zone3: 2,
    kilometers: 110,
    fuelCost: 1300,
    totalWithTax: 5000,
    totalWithoutTax: 4350,
    netProfit: 3050,
  },
  {
    date: "2026-01-19",
    minutes: 480,
    zone1: 6,
    zone2: 3,
    zone3: 1,
    kilometers: 80,
    fuelCost: 950,
    totalWithTax: 3600,
    totalWithoutTax: 3132,
    netProfit: 2182,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("calculator");
  const loadShifts = useShiftsStore((state: any) => state.loadShifts);
  const startNewShift = useShiftsStore((state: any) => state.startNewShift);

  // Load from Supabase (or localStorage fallback)
  const loadShiftsFromSupabase = useLoadShiftsFromSupabase();
  const loadUserSettingsFromSupabase = useLoadUserSettingsFromSupabase();

  // Sync hooks for auto-sync
  useShiftsSync();
  useUserSettingsSync();

  // Initialize app on mount
  useEffect(() => {
    // Initialize demo data if no shifts exist
    const isDemoDataInit = !localStorage.getItem("courier-finance:shifts");
    if (isDemoDataInit) {
      console.log("📝 Loading demo data...");
      localStorage.setItem(
        "courier-finance:shifts",
        JSON.stringify(DEMO_SHIFTS),
      );
      loadShifts();

      // Immediately sync demo data to Supabase
      if (isSupabaseConfigured()) {
        console.log("🔄 Syncing demo data to Supabase...");
        setTimeout(() => {
          syncAllShifts(DEMO_SHIFTS);
        }, 1000);
      }
    } else {
      loadShifts();
    }

    startNewShift();

    // Try to load from Supabase in background (non-blocking)
    setTimeout(() => {
      try {
        console.log("📥 Attempting to load from Supabase...");
        loadUserSettingsFromSupabase();
        loadShiftsFromSupabase();
      } catch (error) {
        console.error("❌ Supabase load failed, using localStorage:", error);
      }
    }, 500);

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
