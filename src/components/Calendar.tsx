import { useMemo, useState } from "react";

interface CalendarProps {
  shifts: Record<string, number>;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  rangeStart?: string;
  rangeEnd?: string;
  onRangeChange?: (start: string, end: string) => void;
  maxValue?: number;
}

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const toDateKey = (year: number, month: number, day: number) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export default function Calendar({
  shifts,
  selectedDate,
  onSelectDate,
  rangeStart,
  rangeEnd,
  onRangeChange,
  maxValue = 5000,
}: CalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(
    selectedDate?.slice(0, 7) ||
      rangeStart?.slice(0, 7) ||
      new Date().toISOString().slice(0, 7),
  );
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const isRangeMode = Boolean(onRangeChange);
  const [year, month] = displayMonth.split("-").map(Number);

  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    return {
      daysInMonth: new Date(year, month, 0).getDate(),
      startingDayOfWeek: (firstDay.getDay() + 6) % 7,
    };
  }, [year, month]);

  const days = useMemo(
    () => [
      ...Array.from({ length: startingDayOfWeek }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ],
    [daysInMonth, startingDayOfWeek],
  );

  const activeStart = rangeStart || pendingStart;
  const activeEnd = rangeEnd || null;
  const normalizedStart = activeStart && activeEnd ? (activeStart < activeEnd ? activeStart : activeEnd) : activeStart;
  const normalizedEnd = activeStart && activeEnd ? (activeStart > activeEnd ? activeStart : activeEnd) : activeEnd;

  const changeMonth = (offset: number) => {
    const next = new Date(year, month - 1 + offset, 1);
    setDisplayMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  };

  const goToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDisplayMonth(today.slice(0, 7));
  };

  const selectDay = (date: string) => {
    if (!isRangeMode) {
      onSelectDate?.(date);
      return;
    }

    if (!activeStart || activeEnd) {
      setPendingStart(date);
      if (activeEnd) onRangeChange?.("", "");
      return;
    }

    const start = date < activeStart ? date : activeStart;
    const end = date < activeStart ? activeStart : date;
    setPendingStart(null);
    onRangeChange?.(start, end);
  };

  const getDayClass = (earnings: number, date: string) => {
    const isSelected = selectedDate === date;
    const isEdge = date === normalizedStart || date === normalizedEnd;
    const isInRange = Boolean(normalizedStart && normalizedEnd && date >= normalizedStart && date <= normalizedEnd);

    if (isEdge || isSelected) return "border-slate-900 bg-slate-900 text-white shadow-sm";
    if (isInRange) return "border-emerald-100 bg-emerald-50 text-slate-900";
    if (!earnings) return "border-transparent bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100";

    const ratio = Math.min(earnings / maxValue, 1);
    if (ratio < 0.35) return "border-emerald-100 bg-emerald-50 text-slate-700 hover:border-emerald-200";
    if (ratio < 0.7) return "border-emerald-200 bg-emerald-100 text-slate-800 hover:border-emerald-300";
    return "border-emerald-300 bg-emerald-200 text-slate-900 hover:border-emerald-400";
  };

  const monthLabel = new Date(year, month - 1).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <section aria-label="Календарь смен">
      <div className="mb-5 flex items-center justify-between gap-2">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Предыдущий месяц" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 active:scale-95">
          <span aria-hidden="true">←</span>
        </button>
        <div className="text-center">
          <h2 className="capitalize text-base font-semibold text-slate-900">{monthLabel}</h2>
          <button type="button" onClick={goToToday} className="mt-0.5 text-xs text-slate-500 transition hover:text-slate-900">Сегодня</button>
        </div>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Следующий месяц" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 active:scale-95">
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => <div key={day} className="pb-1 text-center text-[11px] font-medium text-slate-400">{day}</div>)}
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
          const date = toDateKey(year, month, day);
          const earnings = shifts[date] || 0;
          const isActive = date === normalizedStart || date === normalizedEnd || selectedDate === date;

          return (
            <button
              key={date}
              type="button"
              onClick={() => selectDay(date)}
              aria-label={`${day} ${monthLabel}${earnings ? `, доход ${Math.round(earnings)}` : ""}`}
              className={`relative aspect-square rounded-xl border text-xs font-semibold tabular-nums transition duration-200 active:scale-95 ${getDayClass(earnings, date)}`}
            >
              <span>{day}</span>
              {earnings > 0 && <span className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${isActive ? "bg-white" : "bg-emerald-600"}`} />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span>{pendingStart ? "Выберите последний день периода" : "Нажмите два дня, чтобы выбрать период"}</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-400" /> Есть смена</span>
      </div>
    </section>
  );
}
