interface TimeInputProps {
  label: string;
  /** Total duration in minutes. */
  value: number;
  onChange: (minutes: number) => void;
}

const PRESET_HOURS = [6, 8, 10, 13];

export default function TimeInput({ label, value, onChange }: TimeInputProps) {
  const safeValue = Math.max(0, value);
  const hours = Math.floor(safeValue / 60);
  const minutes = safeValue % 60;

  const updateHours = (rawValue: string) => {
    const nextHours = Math.max(0, Number.parseInt(rawValue, 10) || 0);
    onChange(nextHours * 60 + minutes);
  };

  const updateMinutes = (rawValue: string) => {
    const nextMinutes = Math.min(
      59,
      Math.max(0, Number.parseInt(rawValue, 10) || 0),
    );
    onChange(hours * 60 + nextMinutes);
  };

  const selectPreset = (presetHours: number) => onChange(presetHours * 60);

  return (
    <section className="space-y-3" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <output className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold tabular-nums text-slate-900">
          {hours}ч {minutes.toString().padStart(2, "0")}м
        </output>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Продолжительность
            </p>
            <p className="text-xs text-slate-500">чч : мм</p>
          </div>

          <div className="flex items-end justify-center gap-2" role="group" aria-label="Ввод времени работы">
            <div className="min-w-0 flex-1">
              <label htmlFor="shift-hours" className="mb-1 block text-xs font-medium text-slate-500">
                Часы
              </label>
              <input
                id="shift-hours"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={hours || ""}
                onChange={(event) => updateHours(event.target.value)}
                placeholder="0"
                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-2xl font-semibold tabular-nums text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <span className="mb-3 text-2xl font-semibold text-slate-400" aria-hidden="true">:</span>

            <div className="min-w-0 flex-1">
              <label htmlFor="shift-minutes" className="mb-1 block text-xs font-medium text-slate-500">
                Минуты
              </label>
              <input
                id="shift-minutes"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={minutes || ""}
                onChange={(event) => updateMinutes(event.target.value)}
                placeholder="00"
                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-2xl font-semibold tabular-nums text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Быстрый выбор
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_HOURS.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => selectPreset(preset)}
                className={`min-h-11 rounded-xl border px-2 py-2 text-sm font-semibold transition active:scale-95 ${
                  hours === preset && minutes === 0
                    ? "border-slate-300 bg-white text-slate-900"
                    : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {preset} ч
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Введите часы и минуты вручную или выберите типовую продолжительность смены.
      </p>
    </section>
  );
}
