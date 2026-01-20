import { useState, useMemo, useEffect } from "react";
import { Card, StatCard } from "../components";
import { useShiftsStore, useUserStore } from "../store";
import { formatCurrency } from "../utils/formatting";
import { getLeaderboard, isSupabaseConfigured } from "../utils/supabase";

type PeriodType = "day" | "week" | "month";

interface LeaderboardEntry {
  rank: number;
  username: string;
  earnings: number;
  userId: string;
}

export default function Leaderboard() {
  const shifts = useShiftsStore((state: any) => state.shifts);
  const currency = useUserStore((state: any) => state.settings.currency);
  const leaderboardOptIn = useUserStore(
    (state: any) => state.settings.leaderboardOptIn,
  );

  const [periodType, setPeriodType] = useState<PeriodType>("week");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );

  // Mock data for other couriers (fallback when Supabase disabled)
  // REMOVED: Only use real data from Supabase now
  // const mockCouriers = [...];

  // Get current user data
  const currentUserId =
    localStorage.getItem("courier-finance:user-id") || "dev";
  // const currentUsername = localStorage.getItem("currentUsername") || "Вы"; // Removed - not used

  // Calculate period earnings for current user
  const getPeriodEarnings = (): [string, string] => {
    const today = new Date();

    switch (periodType) {
      case "day": {
        const dateStr = today.toISOString().split("T")[0];
        return [dateStr, dateStr];
      }

      case "week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return [
          weekStart.toISOString().split("T")[0],
          weekEnd.toISOString().split("T")[0],
        ];
      }

      case "month": {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return [
          monthStart.toISOString().split("T")[0],
          monthEnd.toISOString().split("T")[0],
        ];
      }

      default:
        return [
          today.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
        ];
    }
  };

  const [pStart, pEnd] = getPeriodEarnings();

  const currentUserEarnings = useMemo(() => {
    return shifts
      .filter((s: any) => s.date >= pStart && s.date <= pEnd)
      .reduce((sum: number, s: any) => sum + s.totalWithoutTax, 0);
  }, [shifts, pStart, pEnd]);

  // Generate mock earnings for other couriers (varied amounts)
  // REMOVED: No longer generating mock data, using only Supabase data
  // const generateMockLeaderboard = (): void => { ... };

  // Load leaderboard data from Supabase
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        if (isSupabaseConfigured()) {
          // Load from Supabase
          const data = await getLeaderboard(pStart, pEnd, 5);

          if (data && data.length > 0) {
            const entries = data.map((item: any) => ({
              rank: item.rank,
              userId: item.telegram_id,
              username: item.username,
              earnings: item.total_earnings,
            }));
            setLeaderboardData(entries);
            return;
          }
        }

        // No data available - show empty leaderboard
        console.log("⚠️ No leaderboard data available from Supabase");
        setLeaderboardData([]);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setLeaderboardData([]);
      }
    };

    loadLeaderboard();
  }, [pStart, pEnd]);

  const topCouriers = leaderboardData.slice(0, 5);

  // Medal emojis for top 3
  const getMedal = (rank: number): string => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-safe pl-safe pr-safe">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🏆 Рейтинг</h1>
          <p className="text-gray-600 text-sm mt-1">
            Top-5 курьеров по заработку
          </p>
        </div>

        {/* Period Selector */}
        <Card variant="elevated" className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            {(["day", "week", "month"] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setPeriodType(period)}
                className={`py-2 px-2 text-xs font-semibold rounded transition-colors ${
                  periodType === period
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {period === "day"
                  ? "День"
                  : period === "week"
                    ? "Неделя"
                    : "Месяц"}
              </button>
            ))}
          </div>
        </Card>

        {/* Info Section */}
        {!leaderboardOptIn && (
          <Card className="mb-4 bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-gray-700">
              ℹ️{" "}
              <span className="font-semibold">
                Вы не участвуете в рейтинге.
              </span>{" "}
              Включите опцию в профиле ⚙️
            </p>
          </Card>
        )}

        {/* Leaderboard */}
        {topCouriers.length > 0 ? (
          <Card variant="elevated" className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ТОП-5</h2>
            <div className="space-y-3">
              {topCouriers.map((courier) => (
                <div
                  key={courier.userId}
                  className={`p-4 rounded-lg flex items-center gap-3 transition-all ${
                    courier.userId === currentUserId
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400 shadow-md"
                      : "bg-white border border-gray-200 hover:shadow-md"
                  }`}
                >
                  {/* Medal / Rank */}
                  <div className="text-3xl font-bold w-12 text-center flex-shrink-0">
                    {getMedal(courier.rank)}
                  </div>

                  {/* Avatar placeholder - would use photo_url from Telegram in production */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">👤</span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {courier.username}
                      {courier.userId === currentUserId && (
                        <span className="ml-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          ВЫ
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600">
                      #{courier.rank} место
                    </p>
                  </div>

                  {/* Earnings */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-green-600">
                      {formatCurrency(courier.earnings, currency)}
                    </p>
                    <p className="text-xs text-gray-500">{currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card variant="elevated" className="text-center py-8 text-gray-600">
            <p>Нет данных о заработках за выбранный период</p>
          </Card>
        )}

        {/* Stats */}
        {leaderboardOptIn && (
          <div className="space-y-3">
            <StatCard
              label="Ваш заработок"
              value={currentUserEarnings}
              unit={currency}
              color="blue"
              icon="💰"
            />
            {topCouriers[0]?.userId === currentUserId ? (
              <StatCard
                label="Вы в лидерах!"
                value={topCouriers[0].earnings - currentUserEarnings}
                unit={currency}
                color="green"
                icon="🎉"
              />
            ) : topCouriers.length > 0 ? (
              <StatCard
                label="До лидера"
                value={topCouriers[0].earnings - currentUserEarnings}
                unit={currency}
                color="orange"
                icon="📈"
              />
            ) : null}
          </div>
        )}

        {/* Info Card */}
        <Card className="text-xs text-gray-600 bg-gray-100 mt-4">
          <p className="mt-1">
            📱 Данные обновляются в реальном времени для участников рейтинга
          </p>
        </Card>
      </div>
    </div>
  );
}
