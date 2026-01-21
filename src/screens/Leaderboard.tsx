import { useState, useMemo, useEffect } from "react";
import { Card } from "../components";
import { useShiftsStore, useUserStore } from "../store";
import { formatCurrency, formatMonthYear } from "../utils/formatting";
import { getLeaderboard, isSupabaseConfigured } from "../utils/supabase";

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

  // Month navigation state
  const [displayMonth, setDisplayMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  ); // YYYY-MM

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [previousMonthData, setPreviousMonthData] = useState<
    LeaderboardEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current user data
  const currentUserId =
    localStorage.getItem("courier-finance:user-id") || "dev";

  // Parse display month
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

  // Calculate previous month dates
  const previousMonthStart = useMemo(() => {
    const prevDate = new Date(displayYear, displayMonthNum - 2, 1);
    return `${String(prevDate.getFullYear()).padStart(4, "0")}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-01`;
  }, [displayYear, displayMonthNum]);

  const previousMonthEnd = useMemo(
    () =>
      new Date(displayYear, displayMonthNum - 1, 0).toISOString().split("T")[0],
    [displayYear, displayMonthNum],
  );

  // Navigation handlers
  const handlePrevMonth = () => {
    const date = new Date(displayYear, displayMonthNum - 2, 1);
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYear = date.getFullYear();
    setDisplayMonth(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const date = new Date(displayYear, displayMonthNum, 1);
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYear = date.getFullYear();
    setDisplayMonth(`${newYear}-${newMonth}`);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setDisplayMonth(today.slice(0, 7));
  };

  // Load leaderboard data from Supabase
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        if (isSupabaseConfigured()) {
          // Load current month data
          const currentData = await getLeaderboard(monthStart, monthEnd, 100);
          if (currentData && currentData.length > 0) {
            const entries = currentData.map((item: any) => ({
              rank: item.rank,
              userId: item.telegram_id,
              username: item.username,
              earnings: item.total_earnings,
            }));
            setLeaderboardData(entries);
          } else {
            setLeaderboardData([]);
          }

          // Load previous month data for comparison
          const prevData = await getLeaderboard(
            previousMonthStart,
            previousMonthEnd,
            100,
          );
          if (prevData && prevData.length > 0) {
            const entries = prevData.map((item: any) => ({
              rank: item.rank,
              userId: item.telegram_id,
              username: item.username,
              earnings: item.total_earnings,
            }));
            setPreviousMonthData(entries);
          } else {
            setPreviousMonthData([]);
          }
        } else {
          setLeaderboardData([]);
          setPreviousMonthData([]);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setLeaderboardData([]);
        setPreviousMonthData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [monthStart, monthEnd, previousMonthStart, previousMonthEnd]);

  // Calculate current user stats
  const currentUserEarnings = useMemo(() => {
    return shifts
      .filter((s: any) => s.date >= monthStart && s.date <= monthEnd)
      .reduce((sum: number, s: any) => sum + s.totalWithoutTax, 0);
  }, [shifts, monthStart, monthEnd]);

  const currentUserRank = useMemo(() => {
    return (
      leaderboardData.find((e) => e.userId === currentUserId)?.rank || null
    );
  }, [leaderboardData, currentUserId]);

  const gapToLeader = useMemo(() => {
    if (leaderboardData.length === 0) return 0;
    return leaderboardData[0].earnings - currentUserEarnings;
  }, [leaderboardData, currentUserEarnings]);

  // Calculate rank change compared to previous month
  const getRankChange = (
    userId: string,
  ): { change: number; isNew: boolean } => {
    const currentRank = leaderboardData.find((e) => e.userId === userId)?.rank;
    const previousRank = previousMonthData.find(
      (e) => e.userId === userId,
    )?.rank;

    if (!currentRank) return { change: 0, isNew: false };
    if (!previousRank) return { change: 0, isNew: true };

    return { change: previousRank - currentRank, isNew: false };
  };

  // Get dynamic indicator (arrow and text)
  const getDynamicIndicator = (userId: string): string => {
    const { change, isNew } = getRankChange(userId);

    if (isNew) return "🌟 Новичок";
    if (change > 0) return `↑ +${change}`;
    if (change < 0) return `↓ ${change}`;
    return "─ Без изменений";
  };

  // Get dynamic color
  const getDynamicColor = (userId: string): string => {
    const { change, isNew } = getRankChange(userId);

    if (isNew) return "text-blue-600";
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-500";
  };

  // Get medal emoji
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

  // Navigation icons
  const NavIcons = {
    prev: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    next: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    today: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="15" r="2" />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-safe pl-safe pr-safe overflow-x-hidden">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Рейтинг</h1>
          <p className="text-sm text-gray-500 mt-1">
            Лучшие курьеры месяца (кто спиздил больше всех)
          </p>
        </div>

        {/* Month Navigation */}
        <Card variant="elevated" className="mb-6">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Предыдущий месяц"
            >
              {NavIcons.prev}
            </button>

            <h3 className="text-sm font-semibold text-gray-800 flex-1 text-center">
              {formatMonthYear(displayMonth)}
            </h3>

            <button
              onClick={handleToday}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Перейти на текущий месяц"
            >
              <div className="flex flex-col items-center justify-center">
                {NavIcons.today}
                <p className="text-gray-700 text-xs">Сегодня</p>
              </div>
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Следующий месяц"
            >
              {NavIcons.next}
            </button>
          </div>
        </Card>

        {/* Info Section */}
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

        {/* Current User Card (Always Visible) */}
        {leaderboardOptIn && (
          <Card
            variant="elevated"
            className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-600 mb-1">
                  ВАШ РЕЗУЛЬТАТ
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(currentUserEarnings, currency)}
                </p>
                {currentUserRank && (
                  <p className="text-xs text-blue-700 mt-1">
                    #{currentUserRank} место в рейтинге
                  </p>
                )}
              </div>
              <div className="text-right">
                {currentUserRank === 1 && <p className="text-3xl mb-1">🥇</p>}
                {gapToLeader > 0 && currentUserRank !== 1 && (
                  <div>
                    <p className="text-xs text-blue-600 font-medium">
                      До лидера
                    </p>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatCurrency(gapToLeader, currency)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard List */}
        {isLoading ? (
          <Card variant="elevated" className="text-center py-8">
            <p className="text-gray-600">Загрузка рейтинга...</p>
          </Card>
        ) : leaderboardData.length > 0 ? (
          <Card variant="elevated">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              ТОП КУРЬЕРОВ
            </h3>
            <div className="space-y-3">
              {leaderboardData.map((courier) => {
                const isCurrentUser = courier.userId === currentUserId;
                return (
                  <div
                    key={courier.userId}
                    className={`p-4 rounded-lg flex items-center gap-3 transition-all ${
                      isCurrentUser
                        ? "bg-blue-50 border-2 border-blue-300 shadow-sm"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {/* Rank / Medal */}
                    <div className="text-center w-12 flex-shrink-0">
                      {courier.rank <= 3 ? (
                        <div className="text-2xl">{getMedal(courier.rank)}</div>
                      ) : (
                        <div className="text-lg font-bold text-gray-500">
                          #{courier.rank}
                        </div>
                      )}
                    </div>

                    {/* Username */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {courier.username}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            ВЫ
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {courier.rank}
                          {courier.rank === 1 && " место - Лидер! 🔥"}
                          {courier.rank === 2 && " место"}
                          {courier.rank === 3 && " место"}
                          {courier.rank > 3 && " место"}
                        </p>
                        <span
                          className={`text-xs font-semibold ${getDynamicColor(courier.userId)}`}
                        >
                          {getDynamicIndicator(courier.userId)}
                        </span>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-bold text-lg ${
                          isCurrentUser ? "text-blue-700" : "text-green-600"
                        }`}
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
          <Card variant="elevated" className="text-center py-8 text-gray-600">
            <p>Нет данных о курьерах за выбранный месяц</p>
          </Card>
        )}

        {/* Stats Footer */}
        {leaderboardData.length > 0 && (
          <Card className="mt-6 bg-gray-50 text-xs text-gray-600">
            <p>
              📊 {leaderboardData.length} курьеров участвуют в рейтинге за{" "}
              {formatMonthYear(displayMonth)}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
