import { useEffect, useState } from "react";
import { Button, Input } from "../components";
import { useUserStore } from "../store";
import type { UserSettings } from "../store/types";
import { getFirstName, getTelegramUser } from "../utils/telegram";

interface ProfileProps {
  onAdminAccess?: () => void;
}

export default function Profile({ onAdminAccess }: ProfileProps) {
  const userSettings = useUserStore((state: any) => state.settings);
  const updateSettings = useUserStore((state: any) => state.updateSettings);
  const [formData, setFormData] = useState<UserSettings>(userSettings);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [adminClicks, setAdminClicks] = useState(0);

  useEffect(() => {
    const user = getTelegramUser();
    setTelegramUser(user);

    if (!userSettings.username && getFirstName()) {
      setFormData((current) => ({ ...current, username: getFirstName()! }));
    }
  }, [userSettings.username]);

  useEffect(() => {
    setFormData(userSettings);
  }, [userSettings]);

  const updateField = (field: keyof UserSettings, value: UserSettings[keyof UserSettings]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 3000);
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      updateSettings(formData);
      showNotice("success", "Параметры сохранены.");
    } catch (error) {
      console.error("Failed to save profile settings:", error);
      showNotice("error", "Не удалось сохранить параметры. Попробуйте ещё раз.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    const nextCount = adminClicks + 1;
    setAdminClicks(nextCount);
    if (nextCount === 3) {
      setAdminClicks(0);
      onAdminAccess?.();
    }
  };

  const firstName = getFirstName();
  const displayName = formData.username || firstName || "Курьер";
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-white p-4 pb-safe pl-safe pr-safe">
      <main className="mx-auto max-w-md space-y-5">
        <header className="pt-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Личный кабинет</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Профиль</h1>
          <p className="mt-1 text-sm text-slate-500">Настройки расчёта, профиля и рейтинга.</p>
        </header>

        <section className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5">
          <button
            type="button"
            onClick={handleAvatarClick}
            aria-label="Профиль пользователя"
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700 transition hover:border-slate-300 active:scale-95"
          >
            {telegramUser?.photo_url ? <img src={telegramUser.photo_url} alt="" className="h-full w-full object-cover" /> : initials}
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">{displayName}</h2>
            {telegramUser?.username ? <p className="mt-1 truncate text-sm text-slate-500">@{telegramUser.username}</p> : <p className="mt-1 text-sm text-slate-500">Курьер</p>}
            {telegramUser?.id && <p className="mt-1 text-xs text-slate-400">Telegram ID: {telegramUser.id}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5">
          <div className="mb-4"><h2 className="text-base font-semibold text-slate-900">Отображаемое имя</h2><p className="mt-1 text-xs text-slate-500">Оно будет видно в таблице лидеров.</p></div>
          <Input
            type="text"
            value={formData.username}
            placeholder="Введите имя"
            onChange={(event) => updateField("username", event.target.value)}
            className="w-full rounded-xl bg-slate-50"
          />
          {firstName && formData.username !== firstName && <button type="button" onClick={() => updateField("username", firstName)} className="mt-3 text-sm font-medium text-slate-600 transition hover:text-slate-900">Использовать имя Telegram: {firstName}</button>}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5">
          <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-slate-900">Тарифы</h2><p className="mt-1 text-xs text-slate-500">Используются при расчёте каждой смены.</p></div><span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-500">Текущие</span></div>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100">
            <div className="border-b border-r border-slate-100 p-3"><p className="text-xs text-slate-500">За минуту</p><p className="mt-1 text-base font-semibold text-slate-900">{formData.ratePerMinute}</p></div>
            <div className="border-b border-slate-100 p-3"><p className="text-xs text-slate-500">Коэффициент</p><p className="mt-1 text-base font-semibold text-slate-900">{formData.taxCoefficient}</p></div>
            <div className="border-r border-slate-100 p-3"><p className="text-xs text-slate-500">Зона 1</p><p className="mt-1 text-base font-semibold text-slate-900">{formData.priceZone1}</p></div>
            <div className="p-3"><p className="text-xs text-slate-500">Зона 2 / 3</p><p className="mt-1 text-base font-semibold text-slate-900">{formData.priceZone2} / {formData.priceZone3}</p></div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-900/5">
          <div className="p-4 pb-3"><h2 className="text-base font-semibold text-slate-900">Параметры</h2><p className="mt-1 text-xs text-slate-500">Выберите, как учитывать смены и показывать профиль.</p></div>
          <label className="flex cursor-pointer items-center gap-3 border-t border-slate-100 p-4 transition hover:bg-slate-50">
            <input type="checkbox" checked={formData.fuelTrackingEnabled} onChange={(event) => updateField("fuelTrackingEnabled", event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-emerald-600" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">Учитывать бензин</span><span className="mt-1 block text-xs leading-5 text-slate-500">Вычитать расход топлива из чистой прибыли.</span></span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 border-t border-slate-100 p-4 transition hover:bg-slate-50">
            <input type="checkbox" checked={formData.leaderboardOptIn} onChange={(event) => updateField("leaderboardOptIn", event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-emerald-600" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">Участвовать в рейтинге</span><span className="mt-1 block text-xs leading-5 text-slate-500">Видны только имя и доход — без личных данных.</span></span>
          </label>
        </section>

        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${notice ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-live="polite"><div className="overflow-hidden">{notice && <div className={`rounded-xl border px-3 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>{notice.text}</div>}</div></div>

        <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">Готово к сохранению</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Изменения применятся к следующим расчётам и профилю в рейтинге.</p>
          <Button onClick={saveProfile} isLoading={isSaving} size="lg" className="mt-4 w-full">Сохранить изменения</Button>
        </section>
      </main>
    </div>
  );
}
