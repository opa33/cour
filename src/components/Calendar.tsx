import { useMemo, useState } from "react";

interface CalendarProps {
  shifts: Record<string, number>; // date -> netProfit
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  rangeStart?: string;
  rangeEnd?: string;
  onRangeChange?: (start: string, end: string) => void;
  maxValue?: number;
}

export default function Calendar({
  shifts,
  selectedDate,
  onSelectDate,
  rangeStart,
  rangeEnd,
  onRangeChange,
  maxValue = 5000,
}: CalendarProps) {
  // State for month/year navigation
  const [displayMonth, setDisplayMonth] = useState<string>(
    selectedDate?.slice(0, 7) ||
      rangeStart?.slice(0, 7) ||
      new Date().toISOString().slice(0, 7),
  ); // YYYY-MM

  // State for range selection
  const [tempStart, setTempStart] = useState<string | null>(null);
  const [tempEnd, setTempEnd] = useState<string | null>(null);
  const isRangeMode = !!onRangeChange;

  // Check if we should clear temp state
  const shouldClearTemp = rangeStart === undefined && rangeEnd === undefined;

  // Use provided range or temp state (cleared if external range is undefined)
  const currentStart = rangeStart ?? (shouldClearTemp ? null : tempStart);
  const currentEnd = rangeEnd ?? (shouldClearTemp ? null : tempEnd);

  // Helper to get display state - resets temps when cleared
  const displayStart = shouldClearTemp ? null : tempStart;
  const displayEnd = shouldClearTemp ? null : tempEnd;

  // Parse display month
  const [displayYear, displayMonthNum] = displayMonth.split("-").map(Number);

  // Navigation handlers
  const handlePrevMonth = () => {
    const date = new Date(displayYear, displayMonthNum - 2, 1);
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYear = date.getFullYear();
    setDisplayMonth(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const date = new Date(displayYear, displayMonthNum, 1);
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYear = date.getFullYear();
    setDisplayMonth(`${newYear}-${newMonth}`);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setDisplayMonth(today.slice(0, 7));
    if (isRangeMode) {
      setTempStart(today);
      setTempEnd(today);
      onRangeChange?.(today, today);
    } else {
      onSelectDate?.(today);
    }
  };

  // Memoize parsed date values for DISPLAYED month
  const { year, month, daysInMonth, startingDayOfWeek } = useMemo(() => {
    const y = displayYear;
    const m = displayMonthNum;
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    // getDay() returns 0-6 (0=Sunday, 6=Saturday)
    // We want Monday=0, so: (getDay() + 6) % 7
    const dayOfWeek = firstDay.getDay();
    const mondayStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return {
      year: y,
      month: m,
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: mondayStart,
    };
  }, [displayYear, displayMonthNum]);

  const days = useMemo(() => {
    const arr = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      arr.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(i);
    }
    return arr;
  }, [daysInMonth, startingDayOfWeek]);

  const getEarnings = useMemo(
    () =>
      (day: number): number => {
        const dateStr = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return shifts[dateStr] || 0;
      },
    [year, month, shifts],
  );

  const getColor = (earnings: number): string => {
    if (earnings === 0) return "bg-gray-100";
    const ratio = Math.min(earnings / maxValue, 1);

    if (ratio < 0.3) return "bg-yellow-100 border-yellow-300";
    if (ratio < 0.6) return "bg-yellow-200 border-yellow-400";
    if (ratio < 0.8) return "bg-green-200 border-green-400";
    return "bg-green-400 border-green-500";
  };

  const isInRange = (dateStr: string): boolean => {
    if (!currentStart || !currentEnd) return false;
    const start = currentStart <= currentEnd ? currentStart : currentEnd;
    const end = currentStart <= currentEnd ? currentEnd : currentStart;
    return dateStr >= start && dateStr <= end;
  };

  const isRangeEdge = (dateStr: string): boolean => {
    return dateStr === displayStart || dateStr === displayEnd;
  };

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  // Thin stroke SVG icons
  const NavIcons = {
    prev: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    next: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    today: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="15" r="2" />
      </svg>
    ),
  };

  return (
    <div className="w-full">
      {/* Month/Year Header with Navigation */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Предыдущий месяц"
        >
          {NavIcons.prev}
        </button>

        <h3 className="text-sm font-semibold text-gray-800 flex-1 text-center">
          {new Date(year, month - 1).toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          onClick={handleToday}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Перейти на сегодня"
        >
          <div className="flex flex-col items-center justify-center">
            {NavIcons.today}
            <p className="text-gray-700 ml-1 text-xs">Сегодня</p>
          </div>
        </button>

        <button
          onClick={handleNextMonth}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Следующий месяц"
        >
          {NavIcons.next}
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const earnings = getEarnings(day);
          const isSelectedSingle = selectedDate === dateStr;
          const isInRangeMode = isRangeMode && isInRange(dateStr);
          const isEdge = isRangeMode && isRangeEdge(dateStr);
          const color = getColor(earnings);

          const handleDayClick = () => {
            if (isRangeMode) {
              // When resetting, clear temp state completely
              if (shouldClearTemp) {
                setTempStart(null);
                setTempEnd(null);
              }

              if (!displayStart) {
                setTempStart(dateStr);
              } else if (!displayEnd) {
                const start = displayStart <= dateStr ? displayStart : dateStr;
                const end = displayStart <= dateStr ? dateStr : displayStart;
                setTempStart(start);
                setTempEnd(end);
                onRangeChange?.(start, end);
              } else {
                // Reset and start new range
                setTempStart(dateStr);
                setTempEnd(null);
              }
            } else {
              onSelectDate?.(dateStr);
            }
          };

          return (
            <button
              key={day}
              onClick={handleDayClick}
              className={`
                aspect-square rounded border-2 text-xs font-semibold transition-all duration-200
                ${
                  isRangeMode && isInRangeMode
                    ? "bg-blue-100 border-blue-300"
                    : color
                }
                ${
                  isRangeMode && isEdge
                    ? "ring-2 ring-blue-500 scale-110 bg-blue-200 border-blue-400"
                    : isSelectedSingle
                      ? "ring-2 ring-blue-500 scale-110"
                      : "hover:scale-105"
                }
                ${earnings > 0 ? "cursor-pointer" : "cursor-default"}
                flex flex-col items-center justify-center
              `}
            >
              <span className="text-gray-700">{day}</span>
              {earnings > 0 && (
                <span className="text-xs text-gray-600 mt-0.5">
                  {Math.round(earnings)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
            <span>Нет данных</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded border border-yellow-300"></div>
            <span>Низкий</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded border border-yellow-400"></div>
            <span>Средний</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded border border-green-400"></div>
            <span>Хороший</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded border border-green-500"></div>
            <span>Отличный</span>
          </div>
        </div>
      </div>
    </div>
  );
}
