import { useMemo, useEffect, useState } from "react";
import { Card } from "../components";
import { useShiftsStore, useUserStore } from "../store";
import { formatCurrency } from "../utils/formatting";
import { formatMonthYear } from "../utils/formatting";
import { getUserId } from "../utils/telegram";
import {
  getLeaderboard,
  getUserEarnings,
  isSupabaseConfigured,
} from "../utils/supabase";

interface LeaderboardEntry {
  rank: number;
  username: string;
  earnings: number;
  userId: string;
  ordersCount: number;
  hoursWorked: number;
}

interface UserStats {
  earnings: number;
  ordersCount: number;
  hoursWorked: number;
}

export default function Leaderboard() {
  const currency = useUserStore((state: any) => state.settings.currency);
  const leaderboardOptIn = useUserStore(
    (state: any) => state.settings.leaderboardOptIn,
  );

  const shifts = useShiftsStore((state) => state.shifts);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    earnings: 0,
    ordersCount: 0,
    hoursWorked: 0,
  });
  const [displayMonth, setDisplayMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  ); // YYYY-MM

  const isSupabaseActive = isSupabaseConfigured();

  // Get current user data
  const currentUserId = getUserId() || "dev";

  // Get month/year from displayMonth
  const [displayYear, displayMonthNum] = useMemo(
    () =>
      displayMonth.split("-").map((v) => parseInt(v, 10)) as [number, number],
    [displayMonth],
  );

  // Calculate month start and end dates
  const monthStart = useMemo(
    () =>
      `${String(displayYear).padStart(4, "0")}-${String(displayMonthNum).padStart(2, "0")}-01`,
    [displayYear, displayMonthNum],
  );

  const monthEnd = useMemo(
    () => new Date(displayYear, displayMonthNum, 0).toISOString().split("T")[0],
    [displayYear, displayMonthNum],
  );

  // Month navigation handlers - simpler approach
  const handlePreviousMonth = () => {
    const date = new Date(displayMonth + "-01");
    date.setMonth(date.getMonth() - 1);
    setDisplayMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(displayMonth + "-01");
    date.setMonth(date.getMonth() + 1);
    setDisplayMonth(date.toISOString().slice(0, 7));
  };

  const localSummary = useMemo(() => {
    const [yearPart, monthPart] = displayMonth.split("-").map(Number);
    const filtered = shifts.filter((shift) => {
      const [shiftYear, shiftMonth] = shift.date.split("-").map(Number);
      return shiftYear === yearPart && shiftMonth === monthPart;
    });

    const earnings = filtered.reduce(
      (sum, shift) => sum + shift.totalWithoutTax,
      0,
    );
    const orders = filtered.reduce(
      (sum, shift) => sum + shift.zone1 + shift.zone2 + shift.zone3,
      0,
    );
    const minutes = filtered.reduce((sum, shift) => sum + shift.minutes, 0);

    return {
      earnings,
      orders,
      hoursWorked: minutes / 60,
    };
  }, [shifts, displayMonth]);

  // Load leaderboard data from Supabase or fallback to local shifts
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);

        if (isSupabaseConfigured()) {
          const currentData = await getLeaderboard(monthStart, monthEnd);
          const earnings = await getUserEarnings(monthStart, monthEnd);

          if (currentData && currentData.length > 0) {
            const entries = currentData.map((item: any) => ({
              rank: item.rank,
              userId: item.telegram_id,
              username: item.username,
              earnings: item.total_earnings,
              ordersCount: item.orders_count || 0,
              hoursWorked: item.total_minutes ? item.total_minutes / 60 : 0,
            }));

            setLeaderboardData(entries);

            const currentUserEntry = entries.find(
              (entry) => entry.userId === currentUserId,
            );

            if (currentUserEntry) {
              setUserStats({
                earnings: currentUserEntry.earnings,
                ordersCount: currentUserEntry.ordersCount,
                hoursWorked: currentUserEntry.hoursWorked,
              });
            } else {
              setUserStats({
                earnings: earnings,
                ordersCount: 0,
                hoursWorked: 0,
              });
            }
          } else {
            setLeaderboardData([]);
            setUserStats({
              earnings: earnings,
              ordersCount: 0,
              hoursWorked: 0,
            });
          }
        } else {
          setLeaderboardData([]);
          setUserStats({
            earnings: localSummary.earnings,
            ordersCount: localSummary.orders,
            hoursWorked: localSummary.hoursWorked,
          });
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setLeaderboardData([]);
        setUserStats({
          earnings: localSummary.earnings,
          ordersCount: localSummary.orders,
          hoursWorked: localSummary.hoursWorked,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [
    monthStart,
    monthEnd,
    leaderboardOptIn,
    currentUserId,
    displayMonth,
    localSummary,
  ]);

  const getMedal = (rank: number): string => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-safe pl-safe pr-safe">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Рейтинг</h1>
          <p className="text-sm text-gray-500 mt-1">
            Лучшие курьеры месяца по чистому доходу
          </p>
        </div>

        {(!isSupabaseActive || !leaderboardOptIn) && (
          <Card
            variant="elevated"
            className="mb-6 bg-yellow-50 border border-yellow-200"
          >
            <p className="text-sm text-yellow-900">
              {!isSupabaseActive
                ? "Supabase не подключен — рейтинг доступен только в локальном виде. Для данных за месяц используйте экран Статистика."
                : "Вы не участвуете в рейтинге. Включите опцию в профиле, чтобы появляться в топе."}
            </p>
          </Card>
        )}

        {/* Month Navigation */}
        <Card variant="elevated" className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {formatMonthYear(displayMonth)}
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </Card>

        {/* Your Results Card */}
        <Card variant="elevated" className="mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">
                ВАШ РЕЗУЛЬТАТ
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(userStats.earnings, currency)}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">
                ВАШ РЕЗУЛЬТАТ
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(userStats.earnings, currency)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Заказы
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {userStats.ordersCount}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Часы
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {userStats.hoursWorked.toFixed(1)} ч
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Средн.
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {userStats.hoursWorked > 0
                    ? `${Math.round(userStats.earnings / userStats.hoursWorked)} ${currency}/ч`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </Card>
        {/* Info Section 
        {!leaderboardOptIn && (
          <Card className="mb-6 bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">
                Вы не участвуете в рейтинге.
              </span>{" "}
              Включите опцию в профиле, чтобы появиться в топе.
            </p>
          </Card>
        )}
        */}

        {/* Leaderboard List */}
        {isLoading ? (
          <Card variant="elevated" className="py-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-3 border-blue-200"></div>
                  <div
                    className="absolute inset-0 rounded-full border-3 border-transparent border-t-blue-600 border-r-blue-600"
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
              <p className="text-sm text-gray-600 font-medium">
                Загрузка рейтинга...
              </p>
            </div>
          </Card>
        ) : leaderboardData.length > 0 ? (
          <Card variant="elevated">
            <div className="space-y-3">
              {leaderboardData.map((courier) => {
                const isCurrentUser = courier.userId === currentUserId;
                return (
                  <div
                    key={courier.userId}
                    className={`p-3 rounded-lg flex items-center gap-3 transition-all ${
                      isCurrentUser
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {/* Rank / Medal */}
                    <div className="text-center w-10 flex-shrink-0">
                      {courier.rank <= 3 ? (
                        <div className="text-2xl">{getMedal(courier.rank)}</div>
                      ) : (
                        <div className="text-xs font-bold text-gray-500 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                          {courier.rank}
                        </div>
                      )}
                    </div>

                    {/* Username & Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900 truncate">
                          {courier.username}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                            ВЫ
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>
                            {courier.ordersCount} заказ
                            {courier.ordersCount % 10 === 1 &&
                            courier.ordersCount !== 11
                              ? ""
                              : "ов"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{courier.hoursWorked.toFixed(1)}ч</span>
                        </div>
                        {courier.hoursWorked > 0 && (
                          <div className="col-span-2 text-xs text-gray-500 pt-1 border-t border-gray-300">
                            Средн:{" "}
                            {(courier.earnings / courier.hoursWorked).toFixed(
                              0,
                            )}{" "}
                            {currency}/ч
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-bold text-sm ${isCurrentUser ? "text-blue-600" : "text-green-600"}`}
                      >
                        {formatCurrency(courier.earnings, currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card variant="elevated" className="text-center py-8">
            <p className="text-gray-600 font-medium">Нет данных о курьерах</p>
            <p className="text-xs text-gray-500 mt-2">
              Убедитесь, что у вас есть смены за этот месяц и вы включили
              участие в рейтинге
            </p>
          </Card>
        )}

        {/* Stats Footer */}
        {leaderboardData.length > 0 && (
          <div className="text-center py-2 mt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500">
              {leaderboardData.length} курьер
              {leaderboardData.length === 1
                ? ""
                : leaderboardData.length % 10 >= 2 &&
                    leaderboardData.length % 10 <= 4 &&
                    (leaderboardData.length % 100 < 12 ||
                      leaderboardData.length % 100 > 14)
                  ? "а"
                  : "ов"}{" "}
              в рейтинге
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
