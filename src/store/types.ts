export interface UserSettings {
  ratePerMinute: number;
  priceZone1: number;
  priceZone2: number;
  priceZone3: number;
  taxCoefficient: number;
  currency: string;
  fuelTrackingEnabled: boolean;
  leaderboardOptIn: boolean;
  earningsGoal: number;
}

export interface ShiftRecord {
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

export interface CurrentShift extends Omit<ShiftRecord, "date"> {
  date: string;
}
