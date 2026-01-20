import { useState, useEffect } from "react";
import { Button, Card, NumberInput } from "../components";
import { useUserStore } from "../store";
import type { UserSettings } from "../store/types";
import { getTelegramUser } from "../utils/telegram";

export default function Profile() {
  const userSettings = useUserStore((state: any) => state.settings);
  const updateSettings = useUserStore((state: any) => state.updateSettings);

  const [formData, setFormData] = useState<UserSettings>(userSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Telegram user data
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Initialize Telegram user data
  useEffect(() => {
    const user = getTelegramUser();
    setTelegramUser(user);
    if (user) {
      setDisplayName(user.first_name || user.username || `User ${user.id}`);
      setPhotoUrl(user.photo_url || null);
    }
  }, []);

  // Sync form when settings change
  useEffect(() => {
    setFormData(userSettings);
  }, [userSettings]);

  const handleInputChange = (field: keyof UserSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("❌ Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(userSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-safe pl-safe pr-safe">
      <div className="max-w-md mx-auto">
        {/* User Card - Profile Header */}
        <Card variant="elevated" className="mb-6 p-6 text-center">
          <div className="flex flex-col items-center">
            {/* User Photo */}
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                <span className="text-white text-3xl">👤</span>
              </div>
            )}

            {/* User Name */}
            <h2 className="text-2xl font-bold text-gray-800">{displayName}</h2>

            {/* Username */}
            {telegramUser?.username && (
              <p className="text-sm text-gray-600 mt-1">
                @{telegramUser.username}
              </p>
            )}

            {/* Telegram ID */}
            <p className="text-xs text-gray-500 mt-2">
              ID: {telegramUser?.id || "N/A"}
            </p>
          </div>
        </Card>

        {/* Tariffs Section */}
        <Card variant="elevated" className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            💰 Тарифы
          </h2>

          <div className="space-y-3">
            <NumberInput
              label="За минуту (₽)"
              type="number"
              min={0}
              step={0.01}
              value={formData.ratePerMinute || ""}
              onChange={(e) =>
                handleInputChange(
                  "ratePerMinute",
                  parseFloat(e.target.value) || 0,
                )
              }
            />

            <div className="grid grid-cols-3 gap-2">
              <NumberInput
                label="Зона 1 (₽)"
                type="number"
                min={0}
                value={formData.priceZone1 || ""}
                onChange={(e) =>
                  handleInputChange("priceZone1", parseInt(e.target.value) || 0)
                }
              />
              <NumberInput
                label="Зона 2 (₽)"
                type="number"
                min={0}
                value={formData.priceZone2 || ""}
                onChange={(e) =>
                  handleInputChange("priceZone2", parseInt(e.target.value) || 0)
                }
              />
              <NumberInput
                label="Зона 3 (₽)"
                type="number"
                min={0}
                value={formData.priceZone3 || ""}
                onChange={(e) =>
                  handleInputChange("priceZone3", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <NumberInput
              label="Налог (%)"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={((1 - formData.taxCoefficient) * 100 || 0).toFixed(2)}
              onChange={(e) => {
                const taxPercent = parseFloat(e.target.value) || 0;
                handleInputChange("taxCoefficient", 1 - taxPercent / 100);
              }}
            />
          </div>
        </Card>

        {/* Goals Section */}
        <Card variant="elevated" className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 Цели</h2>

          <div className="space-y-3">
            <NumberInput
              label="Целевой доход в неделю"
              type="number"
              min={0}
              value={formData.earningsGoal || ""}
              onChange={(e) =>
                handleInputChange("earningsGoal", parseInt(e.target.value) || 0)
              }
            />

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fuelTrackingEnabled}
                  onChange={(e) =>
                    handleInputChange("fuelTrackingEnabled", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Учитывать бензин при расчёте
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-1 ml-6">
                Вычитает стоимость бензина из прибыли
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leaderboardOptIn}
                  onChange={(e) =>
                    handleInputChange("leaderboardOptIn", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Участвовать в рейтинге
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-1 ml-6">
                Ваш заработок будет видим в топ-5 (только имя и доход)
              </p>
            </div>
          </div>
        </Card>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm text-center font-semibold">
            ✅ Настройки сохранены!
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            size="lg"
            variant="success"
            className="w-full"
          >
            💾 Сохранить
          </Button>
          <Button
            onClick={handleReset}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            ↩️ Отменить
          </Button>
        </div>
      </div>
    </div>
  );
}
