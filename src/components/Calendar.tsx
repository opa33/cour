import { useMemo, useState } from "react";

interface CalendarProps {
  shifts: Record<string, number>; // date -> netProfit
  selectedDate: string;
  onSelectDate: (date: string) => void;
  maxValue?: number;
}

export default function Calendar({
  shifts,
  selectedDate,
  onSelectDate,
  maxValue = 5000,
}: CalendarProps) {
  // State for month/year navigation
  const [displayMonth, setDisplayMonth] = useState<string>(
    selectedDate.slice(0, 7),
  ); // YYYY-MM

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
    onSelectDate(today);
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

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="w-full">
      {/* Month/Year Header with Navigation */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <button
          onClick={handlePrevMonth}
          className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          title="Предыдущий месяц"
        >
          <span className="text-lg">←</span>
          <span className="hidden sm:inline">Назад</span>
        </button>

        <h3 className="text-lg font-bold text-gray-800 min-w-48 text-center bg-gray-100 px-4 py-2 rounded-lg">
          {new Date(year, month - 1).toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          onClick={handleNextMonth}
          className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          title="Следующий месяц"
        >
          <span className="hidden sm:inline">Вперед</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Today Button */}
      <div className="text-center mb-3">
        <button
          onClick={handleToday}
          className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          title="Перейти на сегодня"
        >
          <span>📅</span>
          <span>Сегодня</span>
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
          const isSelected = selectedDate === dateStr;
          const color = getColor(earnings);

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`
                aspect-square rounded border-2 text-xs font-semibold transition-all duration-200
                ${color}
                ${isSelected ? "ring-2 ring-blue-500 scale-110" : "hover:scale-105"}
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
