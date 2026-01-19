import { useState, useMemo } from "react";
import { useShiftsStore, useUserStore } from "../store";
import { formatDate, formatCurrency } from "../utils/formatting";
import Card from "../components/Card";
import StatCard from "../components/StatCard";

type PeriodType = "day" | "week" | "month" | "custom";

export default function Statistics() {
  const shifts = useShiftsStore((state: any) => state.shifts);
  const currency = useUserStore((state: any) => state.settings.currency);

  const today = new Date().toISOString().split("T")[0];
  const monthAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  })();

  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [startDate, setStartDate] = useState<string>(monthAgo);
  const [endDate, setEndDate] = useState<string>(today);

  // Get period dates
  const getPeriodDates = useMemo(() => {
    const d = new Date(selectedDate);

    switch (periodType) {
      case "day":
        return [selectedDate, selectedDate];

      case "week": {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return [
          weekStart.toISOString().split("T")[0],
          weekEnd.toISOString().split("T")[0],
        ];
      }

      case "month": {
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return [
          monthStart.toISOString().split("T")[0],
          monthEnd.toISOString().split("T")[0],
        ];
      }

      case "custom":
        return [startDate || monthAgo, endDate || today];

      default:
        return [selectedDate, selectedDate];
    }
  }, [periodType, selectedDate, startDate, endDate, monthAgo, today]);

  const [pStart, pEnd] = getPeriodDates;
  const periodShifts = useMemo(
    () => shifts.filter((s: any) => s.date >= pStart && s.date <= pEnd),
    [shifts, pStart, pEnd],
  );

  const totalIncome = useMemo(
    () =>
      periodShifts.reduce((sum: number, s: any) => sum + s.totalWithoutTax, 0),
    [periodShifts],
  );
  const totalWithFuel = useMemo(
    () => periodShifts.reduce((sum: number, s: any) => sum + s.netProfit, 0),
    [periodShifts],
  );
  const totalKm = useMemo(
    () => periodShifts.reduce((sum: number, s: any) => sum + s.kilometers, 0),
    [periodShifts],
  );
  const totalMinutes = useMemo(
    () => periodShifts.reduce((sum: number, s: any) => sum + s.minutes, 0),
    [periodShifts],
  );
  const totalOrders = useMemo(
    () =>
      periodShifts.reduce(
        (sum: number, s: any) => sum + s.zone1 + s.zone2 + s.zone3,
        0,
      ),
    [periodShifts],
  );
  const avgEarning = useMemo(
    () =>
      periodShifts.length > 0
        ? Math.round(totalIncome / periodShifts.length)
        : 0,
    [periodShifts, totalIncome],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📊 Статистика</h1>
          <p className="text-gray-600 text-sm mt-1">
            {pStart === pEnd
              ? `День: ${formatDate(pStart)}`
              : `Период: ${formatDate(pStart)} — ${formatDate(pEnd)}`}
          </p>
        </div>

        {/* Period Selector */}
        <Card variant="elevated" className="mb-4">
          <div className="grid grid-cols-4 gap-2">
            {(["day", "week", "month", "custom"] as PeriodType[]).map(
              (period) => (
                <button
                  key={period}
                  onClick={() => setPeriodType(period)}
                  className={`py-2 px-1 text-xs font-semibold rounded transition-all duration-200 ${
                    periodType === period
                      ? "bg-blue-500 text-white shadow-md scale-105"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {period === "day"
                    ? "День"
                    : period === "week"
                      ? "Неделя"
                      : period === "month"
                        ? "Месяц"
                        : "Период"}
                </button>
              ),
            )}
          </div>
        </Card>

        {/* Date Selector */}
        <Card variant="elevated" className="mb-4">
          <div className="space-y-2">
            {periodType !== "custom" && (
              <>
                <label className="text-sm font-semibold text-gray-700 block">
                  Выбрать дату
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            {periodType === "custom" && (
              <>
                <label className="text-sm font-semibold text-gray-700 block">
                  Начало периода
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="text-sm font-semibold text-gray-700 block mt-3">
                  Конец периода
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="space-y-3 mb-4">
          <StatCard
            label="Всего заработано"
            value={totalIncome}
            unit={currency}
            color="green"
            icon="💰"
          />
          <StatCard
            label="Чистая прибыль"
            value={totalWithFuel}
            unit={currency}
            color={totalWithFuel > 0 ? "green" : "red"}
            icon={totalWithFuel > 0 ? "✅" : "⚠️"}
          />
          <StatCard
            label="Средний доход"
            value={avgEarning}
            unit={currency}
            color="blue"
            icon="📈"
          />
        </div>

        {/* Details */}
        <Card variant="elevated" className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Детали периода
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-gray-600">Смены</p>
              <p className="text-lg font-bold text-blue-600">
                {periodShifts.length}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-gray-600">Часов</p>
              <p className="text-lg font-bold text-purple-600">
                {Math.round(totalMinutes / 60)}ч {totalMinutes % 60}м
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <p className="text-gray-600">Заказов</p>
              <p className="text-lg font-bold text-orange-600">{totalOrders}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-gray-600">Км</p>
              <p className="text-lg font-bold text-green-600">{totalKm}</p>
            </div>
          </div>
        </Card>

        {/* Shifts List */}
        {periodShifts.length > 0 ? (
          <Card variant="elevated">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Смены периода
            </h3>
            <div className="space-y-2">
              {periodShifts.map((shift: any) => (
                <div
                  key={shift.date}
                  className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-800">
                      {formatDate(shift.date)}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(shift.netProfit, currency)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      ⏱️ {Math.round(shift.minutes / 60)}ч • 🧮{" "}
                      {shift.zone1 + shift.zone2 + shift.zone3} заказов • 🚗{" "}
                      {shift.kilometers}км
                    </p>
                    <p>
                      💵 Доход:{" "}
                      {formatCurrency(shift.totalWithoutTax, currency)}
                      {shift.fuelCost > 0 &&
                        ` - ${formatCurrency(shift.fuelCost, currency)} бензина`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card variant="elevated" className="text-center py-8 text-gray-600">
            <p>Нет смен за выбранный период</p>
          </Card>
        )}
      </div>
    </div>
  );
}
