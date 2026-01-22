import { useMemo, useEffect, useState } from "react";
import { Card } from "../components";
import { useUserStore } from "../store";
import { formatCurrency } from "../utils/formatting";
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
  const [userEarnings, setUserEarnings] = useState<number>(0);

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
          const earnings = await getUserEarnings(monthStart, monthEnd);
          console.log("📥 Received leaderboard data:", currentData);
          console.log("💰 User earnings:", earnings);

          setUserEarnings(earnings);

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
    <div className="min-h-screen bg-white p-4 pb-safe pl-safe pr-safe">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Рейтинг</h1>
          <p className="text-sm text-gray-500 mt-1">
            Лучшие курьеры месяца (кто больше спиздил)
          </p>
        </div>

        {/* Your Results Card */}
        <Card variant="elevated" className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-600">
                ВАШ РЕЗУЛЬТАТ
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(userEarnings, currency)}
              </p>
            </div>
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
              {" "}
              {leaderboardData.length} курьер
              {leaderboardData.length > 1 ? "ов" : ""} в рейтинге
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
