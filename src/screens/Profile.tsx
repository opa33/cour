import { useState, useEffect } from "react";
import { Button, Card, Input } from "../components";
import { useUserStore } from "../store";
import type { UserSettings } from "../store/types";
import { getTelegramUser, getFirstName } from "../utils/telegram";

export default function Profile() {
  const userSettings = useUserStore((state: any) => state.settings);
  const updateSettings = useUserStore((state: any) => state.updateSettings);

  const [formData, setFormData] = useState<UserSettings>(userSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Telegram user data
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [telegramUsername, setTelegramUsername] = useState("");

  // Initialize Telegram user data
  useEffect(() => {
    const user = getTelegramUser();
    const firstName = getFirstName();
    setTelegramUser(user);
    if (user?.username) {
      setTelegramUsername(user.username);
      // If username not set in settings, use Telegram first name
      if (!userSettings.username && firstName) {
        setFormData((prev: any) => ({
          ...prev,
          username: firstName,
        }));
      }
    }
  }, [userSettings.username]);

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
      alert("Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-safe pl-safe pr-safe">
      <div className="max-w-md mx-auto">
        {/* Header with Telegram Profile */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            {telegramUser?.photo_url && (
              <img
                src={telegramUser.photo_url}
                alt={formData.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {formData.username}
              </h1>
              {telegramUsername && (
                <p className="text-sm text-gray-500 mt-1">
                  Telegram: @{telegramUsername}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                ID: {telegramUser?.id}
              </p>
            </div>
          </div>
        </div>

        {/* Username Section */}
        <Card variant="elevated" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Профиль</h3>
          </div>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Введите ваш ник"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full"
            />

            {(() => {
              const firstName = getFirstName();
              return firstName && formData.username !== firstName ? (
                <button
                  onClick={() => handleInputChange("username", firstName)}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
                >
                  ↺ Использовать Telegram {firstName}
                </button>
              ) : null;
            })()}

            <p className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              💡 Будет использоваться для рейтинга
            </p>
          </div>
        </Card>
        <Card variant="elevated" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
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
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Тарифы</h3>
          </div>

          <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 mb-1">За минуту</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.ratePerMinute}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-gray-600 mb-1">Зона 1</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.priceZone1}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Зона 2</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.priceZone2}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Зона 3</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.priceZone3}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card variant="elevated" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 0l4.24-4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08 0l4.24 4.24" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Параметры</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fuelTrackingEnabled}
                  onChange={(e) =>
                    handleInputChange("fuelTrackingEnabled", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Учитывать бензин
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Вычитает стоимость из прибыли
                  </p>
                </div>
              </label>
            </div>

            <div className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leaderboardOptIn}
                  onChange={(e) =>
                    handleInputChange("leaderboardOptIn", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Участвовать в рейтинге
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Видны только имя и доход
                  </p>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm text-center font-semibold flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Параметры сохранены!
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          size="lg"
          className="w-full bg-gray-900 text-white"
        >
          Сохранить параметры
        </Button>
      </div>
    </div>
  );
}
