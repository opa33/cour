import { useEffect, useState } from "react";
import { Card } from "../components";
import { useUserStore, useShiftsStore } from "../store";
import { formatCurrency } from "../utils/formatting";
import { supabase, isSupabaseConfigured } from "../utils/supabase";

interface UserStats {
  telegram_id: string;
  username: string;
  total_earnings: number;
  total_orders: number;
  total_minutes: number;
  total_shifts: number;
  avg_earnings_per_hour: number;
  avg_earnings_per_order: number;
  avg_orders_per_shift: number;
  efficiency_rating: number;
}

interface SystemStats {
  totalUsers: number;
  totalEarnings: number;
  totalShifts: number;
  totalOrders: number;
  totalMinutes: number;
  avgEarningsPerHour: number;
}

export default function Admin() {
  const currency = useUserStore((state: any) => state.settings.currency);
  const shifts = useShiftsStore((state: any) => state.shifts);

  const [usersList, setUsersList] = useState<UserStats[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalEarnings: 0,
    totalShifts: 0,
    totalOrders: 0,
    totalMinutes: 0,
    avgEarningsPerHour: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"earnings" | "efficiency" | "shifts">(
    "earnings",
  );

  // Load admin statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        console.log("📊 Loading admin statistics...");

        if (!isSupabaseConfigured()) {
          console.log("⚠️ Supabase not configured");
          setIsLoading(false);
          return;
        }

        // Get all shifts
        const { data: shiftsData, error: shiftsError } = await supabase
          .from("shifts")
          .select("telegram_id, minutes, zone1, zone2, zone3, totalWithTax");

        if (shiftsError) throw shiftsError;

        if (!shiftsData || shiftsData.length === 0) {
          console.log("⚠️ No shifts found");
          setIsLoading(false);
          return;
        }

        // Aggregate shifts data
        const shiftsByUser: Record<
          string,
          {
            total_earnings: number;
            total_orders: number;
            total_minutes: number;
            shift_count: number;
          }
        > = {};

        shiftsData.forEach((shift: any) => {
          if (!shiftsByUser[shift.telegram_id]) {
            shiftsByUser[shift.telegram_id] = {
              total_earnings: 0,
              total_orders: 0,
              total_minutes: 0,
              shift_count: 0,
            };
          }
          shiftsByUser[shift.telegram_id].total_earnings +=
            shift.totalWithTax || 0;
          shiftsByUser[shift.telegram_id].total_orders +=
            (shift.zone1 || 0) + (shift.zone2 || 0) + (shift.zone3 || 0);
          shiftsByUser[shift.telegram_id].total_minutes += shift.minutes || 0;
          shiftsByUser[shift.telegram_id].shift_count += 1;
        });

        // Get user info for all users
        const telegramIds = Object.keys(shiftsByUser);
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("telegram_id, username")
          .in("telegram_id", telegramIds);

        if (usersError) throw usersError;

        // Build full user stats with efficiency rating
        const maxEarningsPerHour =
          Math.max(
            ...Object.values(shiftsByUser).map((s: any) =>
              s.total_minutes > 0
                ? s.total_earnings / (s.total_minutes / 60)
                : 0,
            ),
          ) || 1;

        const fullUserStats: UserStats[] = (usersData || []).map(
          (user: any) => {
            const userStats = shiftsByUser[user.telegram_id];
            const avgEarningsPerHour =
              userStats.total_minutes > 0
                ? userStats.total_earnings / (userStats.total_minutes / 60)
                : 0;

            return {
              telegram_id: user.telegram_id,
              username: user.username || "Unknown",
              total_earnings: userStats.total_earnings,
              total_orders: userStats.total_orders,
              total_minutes: userStats.total_minutes,
              total_shifts: userStats.shift_count,
              avg_earnings_per_hour: avgEarningsPerHour,
              avg_earnings_per_order:
                userStats.total_orders > 0
                  ? userStats.total_earnings / userStats.total_orders
                  : 0,
              avg_orders_per_shift:
                userStats.shift_count > 0
                  ? userStats.total_orders / userStats.shift_count
                  : 0,
              efficiency_rating: Math.round(
                (avgEarningsPerHour / maxEarningsPerHour) * 100,
              ),
            };
          },
        );

        // Sort by earnings
        fullUserStats.sort((a, b) => b.total_earnings - a.total_earnings);
        setUsersList(fullUserStats);

        // Calculate system stats
        const totalEarnings = fullUserStats.reduce(
          (sum, u) => sum + u.total_earnings,
          0,
        );
        const totalOrders = fullUserStats.reduce(
          (sum, u) => sum + u.total_orders,
          0,
        );
        const totalMinutes = fullUserStats.reduce(
          (sum, u) => sum + u.total_minutes,
          0,
        );
        const totalShifts = fullUserStats.reduce(
          (sum, u) => sum + u.total_shifts,
          0,
        );

        setSystemStats({
          totalUsers: fullUserStats.length,
          totalEarnings,
          totalShifts,
          totalOrders,
          totalMinutes,
          avgEarningsPerHour:
            totalMinutes > 0 ? totalEarnings / (totalMinutes / 60) : 0,
        });

        console.log("✅ Admin stats loaded");
      } catch (error) {
        console.error("❌ Failed to load admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [shifts.length]);

  // Get sorted list
  const getSortedList = () => {
    const list = [...usersList];
    if (sortBy === "efficiency") {
      return list.sort((a, b) => b.efficiency_rating - a.efficiency_rating);
    } else if (sortBy === "shifts") {
      return list.sort((a, b) => b.total_shifts - a.total_shifts);
    }
    return list;
  };

  const getEfficiencyColor = (rating: number) => {
    if (rating >= 80) return "text-green-600";
    if (rating >= 60) return "text-blue-600";
    if (rating >= 40) return "text-yellow-600";
    return "text-orange-600";
  };

  const getEfficiencyBar = (rating: number) => {
    if (rating >= 80) return "bg-green-500";
    if (rating >= 60) return "bg-blue-500";
    if (rating >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20 space-y-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Админ-панель</h1>
        <Card className="p-6 text-center text-gray-600">
          Загрузка статистики...
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Админ-панель</h1>
        <p className="text-sm text-gray-600">
          Аналитика платформы и доходность курьеров
        </p>
      </div>

      {/* System Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-2xl font-bold text-blue-900">
            {systemStats.totalUsers}
          </div>
          <div className="text-xs text-blue-700">Активных курьеров</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(systemStats.totalEarnings, currency)}
          </div>
          <div className="text-xs text-green-700">Всего заработано</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-2xl font-bold text-purple-900">
            {systemStats.totalShifts}
          </div>
          <div className="text-xs text-purple-700">Смен выполнено</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-2xl font-bold text-orange-900">
            {systemStats.totalOrders}
          </div>
          <div className="text-xs text-orange-700">Заказов доставлено</div>
        </Card>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy("earnings")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
            sortBy === "earnings"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          💰 Доход
        </button>

        <button
          onClick={() => setSortBy("efficiency")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
            sortBy === "efficiency"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ⚡ КПД
        </button>

        <button
          onClick={() => setSortBy("shifts")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
            sortBy === "shifts"
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📋 Смен
        </button>
      </div>

      {/* Users Profitability Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Доходность курьеров</h2>

        {getSortedList().length === 0 ? (
          <Card className="p-6 text-center text-gray-600">
            Нет данных о доходности
          </Card>
        ) : (
          getSortedList().map((user, index) => {
            const medals = ["🥇", "🥈", "🥉"];
            const medal = index < 3 ? medals[index] : null;

            return (
              <Card
                key={user.telegram_id}
                className="p-4 hover:shadow-md transition"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {medal && <span className="text-xl">{medal}</span>}
                      <h3 className="font-semibold text-sm truncate">
                        {user.username}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(user.total_earnings, currency)}
                    </div>
                  </div>

                  {/* Efficiency Rating */}
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${getEfficiencyColor(user.efficiency_rating)}`}
                    >
                      {user.efficiency_rating}%
                    </div>
                    <div className="text-xs text-gray-600">Эффективность</div>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="mb-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${getEfficiencyBar(user.efficiency_rating)}`}
                    style={{
                      width: `${Math.min(user.efficiency_rating, 100)}%`,
                    }}
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Смен</div>
                    <div className="font-semibold text-sm">
                      {user.total_shifts}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Заказов</div>
                    <div className="font-semibold text-sm">
                      {user.total_orders}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Часов</div>
                    <div className="font-semibold text-sm">
                      {(user.total_minutes / 60).toFixed(1)}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">За час</div>
                    <div className="font-semibold text-sm text-blue-600">
                      {formatCurrency(user.avg_earnings_per_hour, currency)}
                    </div>
                  </div>

                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">За заказ</div>
                    <div className="font-semibold text-sm text-green-600">
                      {formatCurrency(user.avg_earnings_per_order, currency)}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">За смену</div>
                    <div className="font-semibold text-sm text-purple-600">
                      {formatCurrency(
                        user.total_earnings / Math.max(user.total_shifts, 1),
                        currency,
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
