import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: "blue" | "green" | "red" | "orange";
  icon?: React.ReactNode;
}

const colorClasses = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
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
