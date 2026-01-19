import { useEffect, useState } from "react";
import { Button, Card, NumberInput, StatCard } from "../components";
import { calculateShift, type CalculationParams } from "../utils/calculations";
import { useUserStore, useShiftsStore } from "../store";

export default function ShiftCalculator() {
  const userSettings = useUserStore((state: any) => state.settings);
  const {
    currentShift,
    updateCurrentShift,
    saveCurrentShift,
    resetCurrentShift,
  } = useShiftsStore();

  const [calculationResult, setCalculationResult] = useState<ReturnType<
    typeof calculateShift
  > | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize on mount
  useEffect(() => {
    if (!currentShift) {
      resetCurrentShift();
    }
  }, [currentShift, resetCurrentShift]);

  const handleInputChange = (field: string, value: string | number) => {
    updateCurrentShift({
      [field]: typeof value === "string" ? parseInt(value) || 0 : value,
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
      saveCurrentShift();
      // Show success feedback
      setTimeout(() => {
        alert("✅ Смена сохранена!");
        resetCurrentShift();
        setShowResult(false);
        setCalculationResult(null);
        setIsSaving(false);
      }, 300);
    } catch (error) {
      console.error("Failed to save shift:", error);
      setIsSaving(false);
    }
  };

  if (!currentShift) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Курьер Финанс</h1>
          <p className="text-gray-600 text-sm mt-1">
            Расчёт заработка за смену
          </p>
        </div>

        {/* Input Form Card */}
        <Card variant="elevated" className="mb-6">
          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Дата
              </label>
              <input
                type="date"
                value={currentShift.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Minutes */}
            <NumberInput
              label="Минуты работы"
              type="number"
              min={0}
              value={currentShift.minutes || ""}
              onChange={(e) => handleInputChange("minutes", e.target.value)}
              placeholder="480"
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
              onChange={(e) => handleInputChange("kilometers", e.target.value)}
              placeholder="82"
            />

            {/* Fuel Cost */}
            {userSettings.fuelTrackingEnabled && (
              <NumberInput
                label="Бензин (₽)"
                type="number"
                min={0}
                value={currentShift.fuelCost || ""}
                onChange={(e) => handleInputChange("fuelCost", e.target.value)}
                placeholder="1000"
              />
            )}

            {/* Calculate Button */}
            <Button onClick={handleCalculate} size="lg" className="w-full mt-6">
              Рассчитать
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {showResult && calculationResult && (
          <Card variant="elevated" className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Результаты</h2>

            <div className="space-y-3">
              {/* Time Income */}
              <StatCard
                label="Доход за время"
                value={calculationResult.timeIncome}
                unit={userSettings.currency}
                color="blue"
              />

              {/* Orders Income */}
              <StatCard
                label="Доход за заказы"
                value={calculationResult.ordersIncome}
                unit={userSettings.currency}
                color="blue"
              />

              {/* Total With Tax */}
              <StatCard
                label="Итого с налогом"
                value={calculationResult.totalWithTax}
                unit={userSettings.currency}
                color="orange"
              />

              {/* Total Without Tax */}
              <StatCard
                label="Итого без налога"
                value={calculationResult.totalWithoutTax}
                unit={userSettings.currency}
                color="green"
              />

              {/* Net Profit */}
              <StatCard
                label={
                  userSettings.fuelTrackingEnabled
                    ? "Чистая прибыль"
                    : "Прибыль"
                }
                value={calculationResult.netProfit}
                unit={userSettings.currency}
                color={calculationResult.netProfit > 0 ? "green" : "red"}
                icon={calculationResult.netProfit > 0 ? "💰" : "⚠️"}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              size="lg"
              variant="success"
              className="w-full mt-6"
            >
              💾 Сохранить
            </Button>
          </Card>
        )}

        {/* Quick Settings Info */}
        <Card className="text-sm text-gray-600 bg-gray-100">
          <p>
            📋 <span className="font-semibold">Текущие тарифы:</span>
          </p>
          <p>
            • За минуту: {userSettings.ratePerMinute} {userSettings.currency}
          </p>
          <p>
            • Зона 1: {userSettings.priceZone1}, Зона 2:{" "}
            {userSettings.priceZone2}, Зона 3: {userSettings.priceZone3}{" "}
            {userSettings.currency}
          </p>
          <p>
            • Налог: {((1 - userSettings.taxCoefficient) * 100).toFixed(2)}%
          </p>
        </Card>
      </div>
    </div>
  );
}
