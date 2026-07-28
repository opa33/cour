import { useEffect, useState, useMemo } from "react";
import { Button, Card, NumberInput, TimeInput } from "../components";
import { calculateShift, type CalculationParams } from "../utils/calculations";
import { useUserStore, useShiftsStore } from "../store";
import { syncShift, isSupabaseConfigured } from "../utils/supabase";
import { formatCurrency, formatMinutesReadable } from "../utils/formatting";

// Thin stroke minimalist icons
const ResultIcons = {
  timeIncome: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  ordersIncome: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  totalWithTax: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  netIncome: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      <path d="M8 15l-2 6M16 15l2 6" />
    </svg>
  ),
  netProfit: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      <polyline points="3 12 1 14 3 16" />
      <polyline points="21 12 23 14 21 16" />
    </svg>
  ),
};

export default function ShiftCalculator() {
  const userSettings = useUserStore((state: any) => state.settings);
  const {
    currentShift,
    updateCurrentShift,
    saveCurrentShift,
    resetCurrentShift,
    shifts,
  } = useShiftsStore();

  const [calculationResult, setCalculationResult] = useState<ReturnType<
    typeof calculateShift
  > | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const formVisible = !showResult;
  const resultsVisible = showResult && !!calculationResult;

  // Check if we're editing based on currentShift date matching existing shift
  const isEditMode = useMemo(() => {
    if (currentShift) {
      return shifts.some((s: any) => s.date === currentShift.date);
    }
    return false;
  }, [currentShift, shifts]);

  // Initialize on mount and check if editing from URL/prop
  useEffect(() => {
    if (!currentShift) {
      resetCurrentShift();
    }
  }, [currentShift, resetCurrentShift]);

  const handleInputChange = (field: string, value: string | number) => {
    updateCurrentShift({
      [field]:
        field === "date"
          ? value
          : typeof value === "string"
            ? parseInt(value) || 0
            : value,
    });
  };

  const handleCalculate = () => {
    if (!currentShift) return;

    const params: CalculationParams = {
      minutes: currentShift.minutes,
      zone1: currentShift.zone1,
      zone2: currentShift.zone2,
      zone3: currentShift.zone3,
      kilometers: currentShift.kilometers,
      fuelCost: currentShift.fuelCost,
      ratePerMinute: userSettings.ratePerMinute,
      priceZone1: userSettings.priceZone1,
      priceZone2: userSettings.priceZone2,
      priceZone3: userSettings.priceZone3,
      taxCoefficient: userSettings.taxCoefficient,
    };

    const result = calculateShift(params);
    setCalculationResult(result);
    setShowResult(true);
    setStatusMessage({
      type: "info",
      text: "Результаты расчёта обновлены. Проверьте итог и сохраните смену.",
    });

    // Update current shift with calculated values
    updateCurrentShift({
      timeIncome: result.timeIncome,
      ordersIncome: result.ordersIncome,
      totalWithTax: result.totalWithTax,
      totalWithoutTax: result.totalWithoutTax,
      netProfit: result.netProfit,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to local store first
      saveCurrentShift();

      // Try to sync to Supabase if configured
      if (isSupabaseConfigured() && currentShift) {
        console.log("🔄 Attempting to sync shift to Supabase...");
        const syncResult = await syncShift(currentShift);
        if (syncResult) {
          console.log("✅ Shift synced to Supabase");
        } else {
          console.warn("⚠️ Failed to sync to Supabase, but saved locally");
        }
      }

      // Show success feedback
      setTimeout(() => {
        setStatusMessage({
          type: "success",
          text: isEditMode ? "Смена обновлена" : "Смена сохранена",
        });
        resetCurrentShift();
        setShowResult(false);
        setCalculationResult(null);
        setIsSaving(false);
      }, 300);
    } catch (error) {
      console.error("Failed to save shift:", error);
      setStatusMessage({
        type: "error",
        text: "Ошибка при сохранении. Попробуйте ещё раз.",
      });
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetCurrentShift();
    setShowResult(false);
    setCalculationResult(null);
  };

  if (!currentShift) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-4 pb-safe pl-safe pr-safe overflow-x-hidden">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Внесение смены" : "Расчёт смены"}
          </h1>
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
            statusMessage ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"
          }`}
          aria-live="polite"
        >
          <div className="overflow-hidden">
            {statusMessage && (
              <div
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-5 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : statusMessage.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-sky-50 border-sky-200 text-sky-900"
                }`}
              >
                <span className="mt-0.5 text-base leading-none" aria-hidden="true">
                  {statusMessage.type === "success" ? "✓" : statusMessage.type === "error" ? "!" : "i"}
                </span>
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Keep both states mounted so the screen transforms instead of jumping. */}
        <div
          className={`overflow-hidden transition-[max-height,opacity,transform,margin] duration-300 ease-out ${
            formVisible
              ? "max-h-[1400px] opacity-100 translate-y-0 mb-6"
              : "max-h-0 opacity-0 -translate-y-2 pointer-events-none mb-0"
          }`}
          aria-hidden={!formVisible}
        >
          <Card variant="elevated">
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  value={
                    currentShift?.date?.match(/^\d{4}-\d{2}-\d{2}$/)
                      ? currentShift.date
                      : new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                  style={{
                    fontSize: "16px",
                    WebkitAppearance: "none",
                    borderWidth: "1px",
                  }}
                />
              </div>

              {/* Time Input - New Component */}
              <TimeInput
                label="Время работы"
                value={currentShift.minutes || 0}
                onChange={(minutes: number) =>
                  handleInputChange("minutes", minutes)
                }
              />

              {/* Zone Orders */}
              <div className="grid grid-cols-3 gap-2">
                <NumberInput
                  label="Зона 1"
                  type="number"
                  min={0}
                  value={currentShift.zone1 || ""}
                  onChange={(e) => handleInputChange("zone1", e.target.value)}
                />
                <NumberInput
                  label="Зона 2"
                  type="number"
                  min={0}
                  value={currentShift.zone2 || ""}
                  onChange={(e) => handleInputChange("zone2", e.target.value)}
                />
                <NumberInput
                  label="Зона 3"
                  type="number"
                  min={0}
                  value={currentShift.zone3 || ""}
                  onChange={(e) => handleInputChange("zone3", e.target.value)}
                />
              </div>

              {/* Kilometers */}
              <NumberInput
                label="Километраж"
                type="number"
                min={0}
                value={currentShift.kilometers || ""}
                onChange={(e) =>
                  handleInputChange("kilometers", e.target.value)
                }
                placeholder="82"
              />

              {/* Fuel Cost */}
              {userSettings.fuelTrackingEnabled && (
                <NumberInput
                  label="Бензин (₽)"
                  type="number"
                  min={0}
                  value={currentShift.fuelCost || ""}
                  onChange={(e) =>
                    handleInputChange("fuelCost", e.target.value)
                  }
                  placeholder="1000"
                />
              )}

              {/* Calculate Button */}
              <Button
                onClick={handleCalculate}
                size="lg"
                className="w-full mt-6"
              >
                Рассчитать
              </Button>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div
          className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${
            resultsVisible
              ? "max-h-[1800px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 translate-y-2 pointer-events-none"
          }`}
          aria-hidden={!resultsVisible}
        >
          {calculationResult && (
          <div className="pt-1">
            {/* Income Stats - Minimalist Style */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-left gap-2">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-gray-400">
                      {ResultIcons.timeIncome}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      За время
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(
                      calculationResult.timeIncome,
                      userSettings.currency,
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-gray-400">
                      {ResultIcons.ordersIncome}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      За заказы
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(
                      calculationResult.ordersIncome,
                      userSettings.currency,
                    )}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-gray-400">
                    {ResultIcons.totalWithTax}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Доход с налогом
                  </p>
                </div>
                <p className="text-2xl font-semibold text-red-700">
                  {formatCurrency(
                    calculationResult.totalWithTax,
                    userSettings.currency,
                  )}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-gray-400">{ResultIcons.netIncome}</div>
                  <p className="text-xs text-gray-500 font-medium">
                    Доход (чистый)
                  </p>
                </div>
                <p className="text-2xl font-semibold text-green-700">
                  {formatCurrency(
                    calculationResult.totalWithoutTax,
                    userSettings.currency,
                  )}
                </p>
              </div>
              {userSettings.fuelTrackingEnabled && (
                <div
                  className={`p-4 rounded-lg border ${
                    calculationResult.netProfit > 0
                      ? "bg-white border-gray-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`${
                        calculationResult.netProfit > 0
                          ? "text-gray-400"
                          : "text-red-400"
                      }`}
                    >
                      {ResultIcons.netProfit}
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        calculationResult.netProfit > 0
                          ? "text-gray-500"
                          : "text-red-600"
                      }`}
                    >
                      Чистая прибыль
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-semibold ${
                      calculationResult.netProfit > 0
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      calculationResult.netProfit,
                      userSettings.currency,
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Details Card */}
            <Card variant="elevated" className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Детали смены
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Время работы
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMinutesReadable(currentShift.minutes)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Заказов
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentShift.zone1 +
                      currentShift.zone2 +
                      currentShift.zone3}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Километры
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentShift.kilometers} км
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Бензин
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(
                      currentShift.fuelCost,
                      userSettings.currency,
                    )}
                  </p>
                </div>
              </div>
            </Card>

            <section className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Всё готово к сохранению
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Проверьте итог и сохраните смену в журнале.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                size="lg"
                className="mt-4 w-full"
              >
                {isEditMode ? "Обновить смену" : "Сохранить смену"}
              </Button>
            </section>

            {/* Back/Cancel Button */}
            <Button
              onClick={() => {
                setShowResult(false);
                setCalculationResult(null);
              }}
              size="lg"
              variant="outline"
              className="w-full mt-2"
            >
              Назад
            </Button>

            {/* Cancel Button for edit mode */}
            {isEditMode && (
              <Button
                onClick={handleCancel}
                size="lg"
                variant="outline"
                className="w-full mt-2"
              >
                Отмена
              </Button>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
