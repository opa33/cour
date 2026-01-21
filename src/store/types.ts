export interface UserSettings {
  username: string;
  ratePerMinute: number;
  priceZone1: number;
  priceZone2: number;
  priceZone3: number;
  taxCoefficient: number;
  currency: string;
  fuelTrackingEnabled: boolean;
  leaderboardOptIn: boolean;
  earningsGoal: number;
  themePreference: "light" | "dark" | "system";
}

export interface ShiftRecord {
  id?: string; // UUID for Supabase
  date: string;
  minutes: number;
  zone1: number;
  zone2: number;
  zone3: number;
  kilometers: number;
  fuelCost: number;
  timeIncome: number;
  ordersIncome: number;
  totalWithTax: number;
  totalWithoutTax: number;
  netProfit: number;
}

export interface CurrentShift extends ShiftRecord {
  date: string;
}
