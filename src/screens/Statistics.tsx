import { useState, useMemo, lazy, Suspense } from "react";
import { useShiftsStore, useUserStore } from "../store";
import { formatDate, formatCurrency } from "../utils/formatting";
import Card from "../components/Card";
import StatCard from "../components/StatCard";
import Calendar from "../components/Calendar";
import Button from "../components/Button";

// Lazy load charts to reduce initial bundle size
const ChartsContainer = lazy(() =>
  import("../components/ChartsContainer").then((m) => ({
    default: m.ChartsContainer,
  })),
);

type PeriodType = "day" | "week" | "month" | "custom";

export default function Statistics() {
  const shifts = useShiftsStore((state: any) => state.shifts);
  const { updateCurrentShift, deleteShift } = useShiftsStore();
  const currency = useUserStore((state: any) => state.settings.currency);
  const fuelTrackingEnabled = useUserStore(
    (state: any) => state.settings.fuelTrackingEnabled,
  );

  // State management
  const [periodType, setPeriodType] = useState<PeriodType>("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedShiftForAction, setSelectedShiftForAction] = useState<
    string | null
  >(null);

  const today = new Date().toISOString().split("T")[0];
  const monthAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  })();

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
  const totalIncomeWithTax = useMemo(
    () => periodShifts.reduce((sum: number, s: any) => sum + s.totalWithTax, 0),
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

  // Prepare chart data
  const chartData = useMemo(
    () =>
      periodShifts.map((s: any) => ({
        date: s.date,
        income: s.totalWithoutTax,
        netProfit: s.netProfit,
        kilometers: s.kilometers,
      })),
    [periodShifts],
  );

  // Prepare shifts by date map for calendar
  const shiftsByDate = useMemo(
    () =>
      shifts.reduce((acc: Record<string, number>, s: any) => {
        acc[s.date] = s.netProfit;
        return acc;
      }, {}),
    [shifts],
  );

  // Action handlers
  const handleEditShift = (date: string) => {
    const shiftToEdit = shifts.find((s: any) => s.date === date);
    if (shiftToEdit) {
      updateCurrentShift(shiftToEdit);
      setActionModalOpen(false);
      setSelectedShiftForAction(null);
      // Note: In a real app, you'd navigate to ShiftCalculator screen
      alert(
        "ℹ️ Смена загружена. Перейдите на экран 'Расчёт' для редактирования.",
      );
    }
  };

  const handleDeleteShift = (date: string) => {
    if (window.confirm(`❓ Удалить смену от ${formatDate(date)}?`)) {
      deleteShift(date);
      setActionModalOpen(false);
      setSelectedShiftForAction(null);
      alert("✅ Смена удалена!");
    }
  };

  const handleShiftClick = (date: string) => {
    setSelectedShiftForAction(date);
    setActionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-safe pl-safe pr-safe">
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

        {/* Details Panel - MOVED TO TOP */}
        <Card
          variant="elevated"
          className="mb-4 bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-500"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📈 Статистика периода
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-gray-600 text-xs mb-1">Смены</p>
              <p className="text-2xl font-bold text-blue-600">
                {periodShifts.length}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-purple-200">
              <p className="text-gray-600 text-xs mb-1">Часы</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor(totalMinutes / 60)}
                <span className="text-sm">ч</span>
              </p>
              <p className="text-xs text-gray-500">+ {totalMinutes % 60}м</p>
            </div>
            <div className="bg-white p-3 rounded border border-orange-200">
              <p className="text-gray-600 text-xs mb-1">Заказов</p>
              <p className="text-2xl font-bold text-orange-600">
                {totalOrders}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-gray-600 text-xs mb-1">Км</p>
              <p className="text-2xl font-bold text-green-600">{totalKm}</p>
            </div>
          </div>
        </Card>

        {/* Calendar View */}
        {periodType !== "custom" && (
          <Card variant="elevated" className="mb-4">
            <Calendar
              shifts={shiftsByDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              maxValue={Math.max(
                ...(Object.values(shiftsByDate) as number[]),
                5000,
              )}
            />
          </Card>
        )}

        {/* Custom Period Selector */}
        {periodType === "custom" && (
          <Card variant="elevated" className="mb-4">
            <div className="space-y-2">
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
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="space-y-3 mb-4">
          <StatCard
            label="Общий доход (с налогом)"
            value={totalIncomeWithTax}
            unit={currency}
            color="blue"
            icon="📊"
          />
          <StatCard
            label="Доход (без налога)"
            value={totalIncome}
            unit={currency}
            color="green"
            icon="💰"
          />
          {fuelTrackingEnabled && (
            <StatCard
              label="Доход минус бензин"
              value={totalWithFuel}
              unit={currency}
              color={totalWithFuel > 0 ? "green" : "red"}
              icon={totalWithFuel > 0 ? "✅" : "⚠️"}
            />
          )}
          <StatCard
            label="Средний доход за смену"
            value={avgEarning}
            unit={currency}
            color="blue"
            icon="📈"
          />
        </div>

        {/* Charts */}
        <Suspense
          fallback={
            <Card
              variant="elevated"
              className="mb-4 p-4 text-gray-600 text-center"
            >
              Загрузка графиков...
            </Card>
          }
        >
          <ChartsContainer data={chartData} />
        </Suspense>

        {/* Shifts List - MOVED FROM BOTTOM */}
        {periodShifts.length > 0 ? (
          <Card variant="elevated" className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📋 Смены периода
            </h3>
            <div className="space-y-2">
              {periodShifts.map((shift: any) => (
                <div
                  key={shift.date}
                  onClick={() => handleShiftClick(shift.date)}
                  className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-blue-400 cursor-pointer transition-all hover:shadow-md"
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
                      ⏱️ {Math.floor(shift.minutes / 60)}ч {shift.minutes % 60}м
                      • 🧮 {shift.zone1 + shift.zone2 + shift.zone3} заказов •
                      🚗 {shift.kilometers}км
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

        {/* Action Modal */}
        {actionModalOpen && selectedShiftForAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="w-full bg-white rounded-t-2xl p-6 space-y-3 animate-slide-up">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Смена от {formatDate(selectedShiftForAction)}
              </h2>

              <Button
                onClick={() => handleEditShift(selectedShiftForAction)}
                className="w-full bg-blue-500 text-white"
                size="lg"
              >
                ✏️ Редактировать
              </Button>

              <Button
                onClick={() => handleDeleteShift(selectedShiftForAction)}
                className="w-full bg-red-500 text-white"
                size="lg"
              >
                🗑️ Удалить
              </Button>

              <Button
                onClick={() => {
                  setActionModalOpen(false);
                  setSelectedShiftForAction(null);
                }}
                variant="outline"
                className="w-full"
                size="lg"
              >
                ❌ Закрыть
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
