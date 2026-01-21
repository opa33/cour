import { useState, useMemo, lazy, Suspense } from "react";
import { useShiftsStore, useUserStore } from "../store";
import {
  formatDate,
  formatCurrency,
  formatMinutesReadable,
} from "../utils/formatting";
import Card from "../components/Card";
import Calendar from "../components/Calendar";
import Button from "../components/Button";

// Lazy load charts
const ChartsContainer = lazy(() =>
  import("../components/ChartsContainer").then((m) => ({
    default: m.ChartsContainer,
  })),
);

export default function Statistics() {
  const shifts = useShiftsStore((state: any) => state.shifts);
  const { updateCurrentShift, deleteShift } = useShiftsStore();
  const currency = useUserStore((state: any) => state.settings.currency);
  const fuelTrackingEnabled = useUserStore(
    (state: any) => state.settings.fuelTrackingEnabled,
  );

  // State management
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [displayMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedShiftForAction, setSelectedShiftForAction] = useState<
    string | null
  >(null);

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

  // For period view - use range if selected, otherwise use month
  const pStart = rangeStart || monthStart;
  const pEnd = rangeEnd || monthEnd;

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

  // Calculate efficiency metrics
  const incomePerHour = useMemo(
    () => (totalMinutes > 0 ? (totalIncome / totalMinutes) * 60 : 0),
    [totalIncome, totalMinutes],
  );

  const incomePerKm = useMemo(
    () => (totalKm > 0 ? totalIncome / totalKm : 0),
    [totalIncome, totalKm],
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
        acc[s.date] = s.totalWithTax;
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
      alert("Смена загружена. Перейдите на экран 'Расчёт' для редактирования.");
    }
  };

  const handleDeleteShift = (date: string) => {
    if (window.confirm(`Удалить смену от ${formatDate(date)}?`)) {
      deleteShift(date);
      setActionModalOpen(false);
      setSelectedShiftForAction(null);
      alert("Смена удалена!");
    }
  };

  const handleShiftClick = (date: string) => {
    setSelectedShiftForAction(date);
    setActionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 pb-safe pl-safe pr-safe">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Статистика</h1>
          {(rangeStart || rangeEnd) && (
            <p className="text-sm text-gray-500 mt-2">
              {formatDate(rangeStart || selectedDate)} —{" "}
              {formatDate(rangeEnd || selectedDate)}
            </p>
          )}
        </div>

        {/* Calendar View */}
        <Card variant="elevated" className="mb-6">
          <Calendar
            shifts={shiftsByDate}
            rangeStart={rangeStart || undefined}
            rangeEnd={rangeEnd || undefined}
            onRangeChange={(start, end) => {
              setRangeStart(start);
              setRangeEnd(end);
            }}
            maxValue={Math.max(
              ...(Object.values(shiftsByDate) as number[]),
              5000,
            )}
          />
        </Card>

        {/* Period Info */}
        {(rangeStart || rangeEnd) && (
          <Card
            variant="elevated"
            className="mb-6 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                    <circle cx="9" cy="16" r="1" />
                    <circle cx="15" cy="16" r="1" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">ДИАПАЗОН</p>
                  <p className="text-sm font-semibold text-blue-900">
                    {formatDate(rangeStart)} — {formatDate(rangeEnd)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRangeStart("");
                  setRangeEnd("");
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Сбросить
              </button>
            </div>
          </Card>
        )}

        {/* Income Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex flex-row justify-left gap-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Доход с налогом</p>
              <p className="text-xl font-semibold text-red-700">
                {formatCurrency(totalIncomeWithTax, currency)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Доход (чистый)</p>
              <p className="text-xl font-semibold text-green-700">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>
          </div>
          {fuelTrackingEnabled && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">После бензина</p>
              <p
                className={`text-xl font-semibold ${
                  totalWithFuel > 0 ? "text-gray-900" : "text-red-700"
                }`}
              >
                {formatCurrency(totalWithFuel, currency)}
              </p>
            </div>
          )}
        </div>

        {/* Period Details */}
        <Card variant="elevated" className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Итого за период
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Смены</p>
              <p className="text-lg font-semibold text-gray-900">
                {periodShifts.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Время работы</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatMinutesReadable(totalMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Заказов</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalOrders}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Километры</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalKm} км
              </p>
            </div>
          </div>
        </Card>

        {/* Efficiency Metrics */}
        {periodShifts.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-medium mb-1">
                Доход/час
              </p>
              <p className="text-lg font-semibold text-purple-900">
                {formatCurrency(incomePerHour, currency)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-600 font-medium mb-1">
                Доход/км
              </p>
              <p className="text-lg font-semibold text-orange-900">
                {formatCurrency(incomePerKm, currency)}
              </p>
            </div>
          </div>
        )}

        {/* Shifts List */}
        {periodShifts.length > 0 ? (
          <Card variant="elevated">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Смены</h3>
            <div className="space-y-3">
              {periodShifts.map((shift: any) => (
                <div
                  key={shift.date}
                  onClick={() => handleShiftClick(shift.date)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(shift.date)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(shift.totalWithTax, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatMinutesReadable(shift.minutes)} •{" "}
                    {shift.zone1 + shift.zone2 + shift.zone3} заказов •{" "}
                    {shift.kilometers} км
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card variant="elevated" className="text-center py-8 text-gray-600">
            <p>Нет смен за выбранный период</p>
          </Card>
        )}

        {/* Charts */}
        <Suspense
          fallback={
            <Card
              variant="elevated"
              className="mb-6 p-4 text-gray-600 text-center"
            >
              Загрузка...
            </Card>
          }
        >
          <ChartsContainer data={chartData} />
        </Suspense>

        {/* Action Modal */}
        {actionModalOpen && selectedShiftForAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="w-full bg-white rounded-t-2xl p-6 space-y-3 animate-slide-up">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {formatDate(selectedShiftForAction)}
              </h2>

              <Button
                onClick={() => handleEditShift(selectedShiftForAction)}
                className="w-full bg-gray-900 text-white"
                size="lg"
              >
                Редактировать
              </Button>

              <Button
                onClick={() => handleDeleteShift(selectedShiftForAction)}
                className="w-full bg-red-600 text-white"
                size="lg"
              >
                Удалить
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
                Отмена
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
