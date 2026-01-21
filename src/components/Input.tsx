import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`
          px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400
          ${error ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "bg-white"}
          ${className}
        `}
        style={
          {
            fontSize: "16px",
            WebkitAppearance: "none",
            borderWidth: "1px",
          } as any
        }
        {...props}
      />
      {error && <span className="text-sm text-red-500 dark:text-red-400">{error}</span>}
      {helperText && !error && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{helperText}</span>
      )}
    </div>
  );
}
