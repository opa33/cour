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
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
              >
                <path d="M12,12c3.309,0,6-2.691,6-6S15.309,0,12,0,6,2.691,6,6s2.691,6,6,6Zm0-11c2.757,0,5,2.243,5,5s-2.243,5-5,5-5-2.243-5-5S9.243,1,12,1Zm9,22v.5c0,.276-.224,.5-.5,.5s-.5-.224-.5-.5v-.5c0-4.411-3.589-8-8-8s-8,3.589-8,8v.5c0,.276-.224,.5-.5,.5s-.5-.224-.5-.5v-.5c0-4.962,4.038-9,9-9s9,4.038,9,9Z" />
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
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-green-600"
                fill="currentColor"
              >
                <path d="M14.5,15c4.136,0,7.5-3.364,7.5-7.5S18.636,0,14.5,0h-5c-2.481,0-4.5,2.019-4.5,4.5V14H2.5c-.276,0-.5,.224-.5,.5s.224,.5,.5,.5h2.5v3H2.5c-.276,0-.5,.224-.5,.5s.224,.5,.5,.5h2.5v4.59c0,.276,.224,.5,.5,.5s.5-.224,.5-.5v-4.59H15.5c.276,0,.5-.224,.5-.5s-.224-.5-.5-.5H6v-3H14.5ZM6,4.5c0-1.93,1.57-3.5,3.5-3.5h5c3.584,0,6.5,2.916,6.5,6.5s-2.916,6.5-6.5,6.5H6V4.5Z" />
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
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                fill="currentColor"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-purple-600"
              >
                <path d="M21.234,14.174l-.445-.274c.14-.64,.211-1.277,.211-1.899s-.071-1.26-.211-1.899l.445-.274c.682-.421,1.16-1.082,1.344-1.862,.185-.779,.054-1.585-.367-2.267-.869-1.407-2.72-1.845-4.128-.978l-.445,.275c-.801-.647-1.685-1.145-2.638-1.481v-.514c0-1.654-1.346-3-3-3s-3,1.346-3,3v.514c-.953,.337-1.837,.834-2.638,1.481l-.445-.275c-1.409-.867-3.26-.43-4.128,.978-.421,.682-.551,1.487-.367,2.267,.185,.78,.662,1.441,1.344,1.862l.445,.274c-.14,.64-.211,1.277-.211,1.899s.071,1.26,.211,1.899l-.445,.274c-.682,.421-1.16,1.082-1.344,1.862-.185,.779-.054,1.585,.367,2.267,.868,1.407,2.721,1.845,4.128,.978l.445-.275c.801,.647,1.685,1.145,2.638,1.481v.514c0,1.654,1.346,3,3,3s3-1.346,3-3v-.514c.953-.337,1.837-.834,2.638-1.481l.445,.275c1.41,.867,3.26,.43,4.128-.978,.421-.682,.551-1.487,.367-2.267-.185-.78-.662-1.441-1.344-1.862Zm.126,3.604c-.58,.938-1.815,1.232-2.752,.651l-.753-.465c-.187-.114-.427-.095-.592,.05-.862,.756-1.841,1.305-2.91,1.634-.21,.064-.353,.258-.353,.478v.875c0,1.103-.897,2-2,2s-2-.897-2-2v-.875c0-.22-.143-.413-.353-.478-1.069-.329-2.048-.878-2.91-1.634-.094-.082-.211-.124-.33-.124-.091,0-.182,.024-.263,.074l-.753,.465c-.938,.581-2.173,.287-2.752-.651-.28-.454-.367-.991-.244-1.511,.123-.521,.441-.961,.896-1.241l.753-.465c.187-.115,.276-.339,.221-.552-.176-.679-.265-1.354-.265-2.009s.089-1.33,.265-2.009c.055-.213-.035-.437-.221-.552l-.753-.465c-.455-.28-.772-.721-.896-1.241-.123-.52-.036-1.057,.244-1.511,.58-.939,1.814-1.232,2.752-.651l.753,.465c.187,.114,.426,.095,.592-.05,.862-.756,1.841-1.305,2.91-1.634,.21-.064,.353-.258,.353-.478v-.875c0-1.103,.897-2,2-2s2,.897,2,2v.875c0,.22,.143,.413,.353,.478,1.069,.329,2.048,.878,2.91,1.634,.166,.145,.406,.164,.592,.05l.753-.465c.938-.581,2.172-.288,2.752,.651,.28,.454,.367,.991,.244,1.511-.123,.521-.441,.961-.896,1.241l-.753,.465c-.187,.115-.276,.339-.221,.552,.176,.679,.265,1.354,.265,2.009s-.089,1.33-.265,2.009c-.055,.213,.035,.437,.221,.552l.753,.465c.455,.28,.772,.721,.896,1.241,.123,.52,.036,1.057-.244,1.511ZM12,8c-2.206,0-4,1.794-4,4s1.794,4,4,4,4-1.794,4-4-1.794-4-4-4Zm0,7c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Z" />
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
