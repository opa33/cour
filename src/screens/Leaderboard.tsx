import { useMemo, useEffect, useState } from "react";
import { Card } from "../components";
import { useUserStore } from "../store";
import { formatCurrency } from "../utils/formatting";
import { getLeaderboard, isSupabaseConfigured } from "../utils/supabase";

interface LeaderboardEntry {
  rank: number;
  username: string;
  earnings: number;
  userId: string;
}

export default function Leaderboard() {
  const currency = useUserStore((state: any) => state.settings.currency);
  const leaderboardOptIn = useUserStore(
    (state: any) => state.settings.leaderboardOptIn,
  );

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  // Get current user data
  const currentUserId =
    localStorage.getItem("courier-finance:user-id") || "dev";

  // Calculate current month dates
  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(
    () =>
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
    [today],
  );

  const monthEnd = useMemo(
    () =>
      new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
    [today],
  );

  // Load leaderboard data from Supabase
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Loading leaderboard...");
        console.log(`Date range: ${monthStart} to ${monthEnd}`);
        console.log(`Supabase configured: ${isSupabaseConfigured()}`);

        if (isSupabaseConfigured()) {
          // Load current month data
          const currentData = await getLeaderboard(monthStart, monthEnd);
          console.log("📥 Received leaderboard data:", currentData);

          if (currentData && currentData.length > 0) {
            const entries = currentData.map((item: any) => ({
              rank: item.rank,
              userId: item.telegram_id,
              username: item.username,
              earnings: item.total_earnings,
            }));
            console.log("✅ Leaderboard entries:", entries);
            setLeaderboardData(entries);
          } else {
            console.log("⚠️ No leaderboard data returned");
            setLeaderboardData([]);
          }
        } else {
          console.log("⚠️ Supabase not configured");
          setLeaderboardData([]);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [monthStart, monthEnd, leaderboardOptIn]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-safe pl-safe pr-safe overflow-x-hidden">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Рейтинг</h1>
          <p className="text-sm text-gray-600 mt-1">
            Лучшие курьеры месяца (кто списал больше всех)
          </p>
        </div>

        {/* Your Results Card */}
        <Card className="mb-6 bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 shadow-sm">
          <div className="text-center">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              ВАШ РЕЗУЛЬТАТ
            </p>
            <p className="text-4xl font-bold text-blue-900">
              {leaderboardData.length > 0
                ? (() => {
                    const userEarnings =
                      leaderboardData.find((c) => c.userId === currentUserId)
                        ?.earnings || 0;
                    return formatCurrency(userEarnings, currency);
                  })()
                : "0 " + currency}
            </p>
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

        {/* Leaderboard List */}
        {isLoading ? (
          <Card variant="elevated" className="text-center py-8">
            <p className="text-gray-600">⏳ Загрузка рейтинга...</p>
          </Card>
        ) : leaderboardData.length > 0 ? (
          <Card variant="elevated">
            <div className="space-y-2">
              {leaderboardData.map((courier) => {
                const isCurrentUser = courier.userId === currentUserId;
                return (
                  <div
                    key={courier.userId}
                    className={`p-3 rounded-lg flex items-center gap-3 transition-all ${
                      isCurrentUser
                        ? "bg-blue-50 border-l-4 border-blue-400"
                        : "bg-gray-50 border-l-4 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {/* Rank / Medal */}
                    <div className="text-center w-8 flex-shrink-0">
                      {courier.rank <= 3 ? (
                        <div className="text-xl">{getMedal(courier.rank)}</div>
                      ) : (
                        <div className="text-sm font-bold text-gray-500">
                          #{courier.rank}
                        </div>
                      )}
                    </div>

                    {/* Username & Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {courier.username}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                            ВЫ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {courier.rank === 1 && "🔥 Лидер месяца"}
                        {courier.rank === 2 && "🚀 На вершине"}
                        {courier.rank === 3 && "⭐ В топе"}
                        {courier.rank > 3 && `Место ${courier.rank}`}
                      </p>
                    </div>

                    {/* Earnings */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-bold text-base ${isCurrentUser ? "text-blue-600" : "text-green-600"}`}
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
            <p className="text-gray-600 mb-2">📊</p>
            <p className="text-gray-600 font-medium">Нет данных о курьерах</p>
            <p className="text-xs text-gray-500 mt-2">
              Убедитесь, что у вас есть смены за этот месяц и вы включили
              участие в рейтинге
            </p>
          </Card>
        )}

        {/* Stats Footer */}
        {leaderboardData.length > 0 && (
          <Card className="mt-6 bg-blue-50 text-xs text-blue-700 text-center border border-blue-100">
            <p className="font-medium">
              👥 {leaderboardData.length} курьер
              {leaderboardData.length > 1 ? "ов" : ""} в рейтинге
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
