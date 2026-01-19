import { useState } from "react";
import { useShiftsStore, useUserStore } from "../store";
import { formatDate, formatCurrency } from "../utils/formatting";
import Card from "../components/Card";
import Button from "../components/Button";
import StatCard from "../components/StatCard";

type PeriodType = "day" | "week" | "month" | "custom";

export default function Statistics() {
  const shifts = useShiftsStore((state: any) => state.shifts);
  const currency = useUserStore((state: any) => state.settings.currency);
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Get period dates
  const getPeriodDates = (): [string, string] => {
    const today = new Date(selectedDate);

    switch (periodType) {
      case "day":
        return [selectedDate, selectedDate];

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

      case "custom":
        return [startDate, endDate];

      default:
        return [selectedDate, selectedDate];
    }
  };

  const [pStart, pEnd] = getPeriodDates();
  const periodShifts = shifts.filter(
    (s: any) => s.date >= pStart && s.date <= pEnd,
  );

  const totalIncome = periodShifts.reduce(
    (sum: number, s: any) => sum + s.totalWithoutTax,
    0,
  );
  const totalWithFuel = periodShifts.reduce(
    (sum: number, s: any) => sum + s.netProfit,
    0,
  );
  const totalKm = periodShifts.reduce(
    (sum: number, s: any) => sum + s.kilometers,
    0,
  );
  const totalMinutes = periodShifts.reduce(
    (sum: number, s: any) => sum + s.minutes,
    0,
  );
  const totalOrders = periodShifts.reduce(
    (sum: number, s: any) => sum + s.zone1 + s.zone2 + s.zone3,
    0,
  );
  const avgEarning =
    periodShifts.length > 0 ? Math.round(totalIncome / periodShifts.length) : 0;

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
            <button
              onClick={() => setPeriodType("day")}
              className={`py-2 px-1 text-xs font-semibold rounded transition-colors ${
                periodType === "day"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              День
            </button>
            <button
              onClick={() => setPeriodType("week")}
              className={`py-2 px-1 text-xs font-semibold rounded transition-colors ${
                periodType === "week"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setPeriodType("month")}
              className={`py-2 px-1 text-xs font-semibold rounded transition-colors ${
                periodType === "month"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setPeriodType("custom")}
              className={`py-2 px-1 text-xs font-semibold rounded transition-colors ${
                periodType === "custom"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Период
            </button>
          </div>
        </Card>

        {/* Date Selector */}
        <Card variant="elevated" className="mb-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">
              {periodType === "custom" ? "Начало периода" : "Дата"}
            </label>
            <input
              type="date"
              value={periodType === "custom" ? startDate : selectedDate}
              onChange={(e) =>
                periodType === "custom"
                  ? setStartDate(e.target.value)
                  : setSelectedDate(e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {periodType === "custom" && (
              <>
                <label className="text-sm font-semibold text-gray-700 block mt-2">
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
