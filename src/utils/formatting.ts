/**
 * Format minutes to "9 ч 40 мин" format
 */
export const formatMinutesReadable = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} мин`;
  }
  if (minutes === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${minutes} мин`;
};

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

/**
 * Format month and year as readable string (YYYY-MM → "январь 2026")
 */
export const formatMonthYear = (monthString: string): string => {
  const [year, month] = monthString.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
};
