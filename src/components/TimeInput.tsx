import { useMemo } from "react";

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
  const displayValue = useMemo(() => {
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }, [value]);

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
      const hours = parseInt(parts[0]) || 0;
      const mins = Math.min(parseInt(parts[1]) || 0, 59); // Cap minutes at 59
      totalMinutes = hours * 60 + mins;
    }

    onChange(totalMinutes);
  };

  const hours = Math.floor(value / 60);
  const mins = value % 60;

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 block mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent text-lg font-semibold"
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
      <p className="text-xs text-gray-500 mt-1">
        {hours}ч {mins}м = {value} минут
      </p>
    </div>
  );
}
