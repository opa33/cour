import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: "blue" | "green" | "red" | "orange";
  icon?: React.ReactNode;
}

const colorClasses = {
  blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  green:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
  red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
  orange:
    "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
};

export default function StatCard({
  label,
  value,
  unit,
  color = "blue",
  icon,
}: StatCardProps) {
  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold opacity-80">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-bold">{value}</p>
        {unit && <span className="text-sm opacity-75">{unit}</span>}
      </div>
    </div>
  );
}
