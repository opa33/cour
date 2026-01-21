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
    default:
      "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
    elevated:
      "bg-white dark:bg-gray-900 shadow-md dark:shadow-lg dark:shadow-gray-800/50",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
