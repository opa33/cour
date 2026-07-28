interface TimeInputProps {
  label: string;
  /** Total duration in minutes. */
  value: number;
  onChange: (minutes: number) => void;
}

const PRESET_HOURS = [6, 8, 10, 12];

export default function TimeInput({ label, value, onChange }: TimeInputProps) {
  const safeValue = Math.max(0, value);
  const hours = Math.floor(safeValue / 60);
  const mins = safeValue % 60;

  const changeValue = (minutes: number) => {
    onChange(Math.max(0, Math.round(minutes)));
  };

  const adjustHours = (amount: number) => {
    changeValue((hours + amount) * 60 + mins);
  };

  const adjustMinutes = (amount: number) => {
    changeValue(hours * 60 + mins + amount);
  };

  return (
    <section className="space-y-3" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <output className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
          {hours}ч {mins.toString().padStart(2, "0")}м
        </output>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Часы</div>
            <output className="text-3xl font-semibold tabular-nums text-slate-900">{hours}</output>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => adjustHours(-1)}
                aria-label="Уменьшить часы на 1"
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-base font-semibold text-slate-700 transition active:scale-95 hover:bg-slate-200"
              >
                −1
              </button>
              <button
                type="button"
                onClick={() => adjustHours(1)}
                aria-label="Увеличить часы на 1"
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-base font-semibold text-slate-700 transition active:scale-95 hover:bg-slate-200"
              >
                +1
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Минуты</div>
            <output className="text-3xl font-semibold tabular-nums text-slate-900">{mins.toString().padStart(2, "0")}</output>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => adjustMinutes(-15)}
                aria-label="Уменьшить время на 15 минут"
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-base font-semibold text-slate-700 transition active:scale-95 hover:bg-slate-200"
              >
                −15
              </button>
              <button
                type="button"
                onClick={() => adjustMinutes(15)}
                aria-label="Увеличить время на 15 минут"
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-base font-semibold text-slate-700 transition active:scale-95 hover:bg-slate-200"
              >
                +15
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Быстрые значения</div>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_HOURS.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => changeValue(preset * 60)}
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-100 px-2 py-2 text-sm font-semibold text-slate-700 transition active:scale-95 hover:bg-slate-200"
              >
                {preset} ч
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">Выберите типовую смену или скорректируйте её шагами — клавиатура не понадобится.</p>
    </section>
  );
}
