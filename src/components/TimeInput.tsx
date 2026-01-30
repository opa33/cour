import { useMemo, useState } from "react";

interface TimeInputProps {
  label: string;
  value: number; // total minutes
  onChange: (minutes: number) => void;
  placeholder?: string;
}

export default function TimeInput({
  label,
  value,
  onChange,
  placeholder = "8:30",
}: TimeInputProps) {
  const [inputMode, setInputMode] = useState<"combined" | "split">("split");

  const hours = useMemo(() => Math.floor(value / 60), [value]);
  const mins = useMemo(() => value % 60, [value]);

  const displayValue = useMemo(() => {
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }, [hours, mins]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^\d:]/g, ""); // Only digits and colon

    // Parse input
    const parts = input.split(":").filter((p) => p);
    if (parts.length === 0) {
      onChange(0);
      return;
    }

    let totalMinutes = 0;

    if (parts.length === 1) {
      // Only one number - treat as minutes if <= 60, otherwise as hours
      const num = parseInt(parts[0]) || 0;
      if (num <= 60) {
        totalMinutes = num;
      } else {
        // If > 60, convert to hours (e.g., 120 → 2:00)
        totalMinutes = num * 60;
      }
    } else if (parts.length >= 2) {
      // Two or more numbers - first is hours, second is minutes
      const h = parseInt(parts[0]) || 0;
      const m = Math.min(parseInt(parts[1]) || 0, 59); // Cap minutes at 59
      totalMinutes = h * 60 + m;
    }

    onChange(totalMinutes);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = Math.max(0, parseInt(e.target.value) || 0);
    onChange(h * 60 + mins);
  };

  const handleMinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
    onChange(hours * 60 + m);
  };

  const handleIncrement = (field: "hours" | "mins", amount: number) => {
    if (field === "hours") {
      onChange((hours + amount) * 60 + mins);
    } else {
      const newMins = mins + amount;
      if (newMins < 0) {
        onChange(Math.max(0, (hours - 1) * 60 + (newMins + 60)));
      } else if (newMins >= 60) {
        onChange((hours + 1) * 60 + (newMins - 60));
      } else {
        onChange(hours * 60 + newMins);
      }
    }
  };

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 block mb-2">
        {label}
      </label>

      {/* Combined input mode */}
      {inputMode === "combined" && (
        <div className="relative mb-2">
          <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent text-lg font-semibold text-center"
            style={{
              fontSize: "16px",
              WebkitAppearance: "none",
              borderWidth: "1px",
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            ч:м
          </span>
        </div>
      )}

      {/* Split input mode */}
      {inputMode === "split" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Hours input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 font-medium">Часы</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleIncrement("hours", -1)}
                    className="w-6 h-6 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    −
                  </button>
                  <button
                    onClick={() => handleIncrement("hours", 1)}
                    className="w-6 h-6 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={value > 0 ? hours : ""}
                onChange={handleHoursChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent text-lg font-semibold text-center"
                style={{
                  fontSize: "16px",
                  WebkitAppearance: "none",
                  borderWidth: "1px",
                }}
              />
            </div>

            {/* Minutes input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 font-medium">
                  Минуты
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleIncrement("mins", -15)}
                    className="w-6 h-6 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    −15
                  </button>
                  <button
                    onClick={() => handleIncrement("mins", 15)}
                    className="w-6 h-6 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    +15
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={value > 0 ? mins : ""}
                onChange={handleMinsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent text-lg font-semibold text-center"
                style={{
                  fontSize: "16px",
                  WebkitAppearance: "none",
                  borderWidth: "1px",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toggle and summary */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500">
          {hours}ч {mins}м = <span className="font-semibold">{value}</span>{" "}
          минут
        </p>
        <button
          onClick={() =>
            setInputMode(inputMode === "combined" ? "split" : "combined")
          }
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {inputMode === "combined" ? "По частям" : "Вместе"}
        </button>
      </div>
    </div>
  );
}
