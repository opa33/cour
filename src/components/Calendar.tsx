import { useMemo } from "react";

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
  // Memoize parsed date values
  const { year, month, daysInMonth, startingDayOfWeek } = useMemo(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    return {
      year: y,
      month: m,
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  }, [selectedDate]);

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
      {/* Month/Year Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {new Date(year, month - 1).toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}
        </h3>
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
