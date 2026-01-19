import { useState, useMemo } from "react";
import { Card, StatCard } from "../components";
import { useShiftsStore, useUserStore } from "../store";
import { formatCurrency } from "../utils/formatting";

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

  // Mock data for other couriers (in production will come from Supabase)
  const mockCouriers = [
    {
      userId: "user-2",
      username: "Иван",
      avatar: "👨",
    },
    {
      userId: "user-3",
      username: "Петр",
      avatar: "👨",
    },
    {
      userId: "user-4",
      username: "Елена",
      avatar: "👩",
    },
    {
      userId: "user-5",
      username: "Мария",
      avatar: "👩",
    },
  ];

  // Get current user data
  const currentUserId = "user-1";
  const currentUsername = localStorage.getItem("currentUsername") || "Вы";

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
  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const entries: LeaderboardEntry[] = [];

    // Add current user if opted in
    if (leaderboardOptIn) {
      entries.push({
        rank: 0,
        userId: currentUserId,
        username: currentUsername,
        earnings: currentUserEarnings,
      });
    }

    // Add mock couriers with random earnings (±30% from current user)
    mockCouriers.forEach((courier) => {
      const variance = (Math.random() - 0.5) * 0.6; // ±30%
      const baseEarnings = currentUserEarnings * (1 + variance);
      entries.push({
        rank: 0,
        userId: courier.userId,
        username: courier.username,
        earnings: Math.max(0, Math.round(baseEarnings)),
      });
    });

    // Sort by earnings descending
    entries.sort((a, b) => b.earnings - a.earnings);

    // Add ranks
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  };

  const leaderboard = generateMockLeaderboard();
  const topCouriers = leaderboard.slice(0, 5);

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
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
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
            <div className="space-y-2">
              {topCouriers.map((courier) => (
                <div
                  key={courier.userId}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    courier.userId === currentUserId
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl font-bold w-8 text-center">
                      {getMedal(courier.rank)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {courier.username}
                        {courier.userId === currentUserId && " (вы)"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Позиция #{courier.rank}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      {formatCurrency(courier.earnings, currency)}
                    </p>
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
