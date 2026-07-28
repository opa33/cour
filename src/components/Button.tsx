import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-950 hover:bg-slate-800 text-white shadow-sm shadow-slate-200/10",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  outline:
    "bg-transparent border border-slate-300 hover:border-slate-400 text-slate-900 hover:bg-slate-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        font-semibold rounded-lg transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 transition-transform
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ fontSize: "16px", WebkitTouchCallout: "none" } as any}
      {...props}
    >
      {isLoading ? "⏳ Загрузка..." : children}
    </button>
  );
}
