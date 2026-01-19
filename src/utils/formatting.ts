/**
 * Format number as currency with symbol
 */
export const formatCurrency = (
  value: number,
  currency: string = "₽",
): string => {
  return `${value.toLocaleString("ru-RU")} ${currency}`;
};

/**
 * Format date as readable string (YYYY-MM-DD → "17 янв 2026")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

/**
 * Format minutes to HH:MM format
 */
export const formatMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Parse time string "HH:MM" to total minutes
 */
export const parseTimeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};
