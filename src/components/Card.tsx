import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "elevated";
}

export default function Card({
  title,
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const baseClasses = "rounded-lg p-4";
  const variantClasses = {
    default: "bg-slate-50 border border-slate-200",
    elevated: "bg-white shadow-xl shadow-slate-900/5 border border-slate-200",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
