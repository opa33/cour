/**
 * Courier Finance Calculation Engine
 * Implements the calculation pipeline as per specification
 *
 * CRITICAL: taxCoefficient is applied ONCE in step 4
 */

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

export interface CalculationParams {
  minutes: number;
  zone1: number;
  zone2: number;
  zone3: number;
  kilometers: number;
  fuelCost: number;
  ratePerMinute: number;
  priceZone1: number;
  priceZone2: number;
  priceZone3: number;
  taxCoefficient: number;
}

/**
 * Step 1: Calculate income from time worked
 */
export const calculateTimeIncome = (
  minutes: number,
  ratePerMinute: number,
): number => {
  return Math.round(minutes * ratePerMinute);
};

/**
 * Step 2: Calculate income from orders by zone
 */
export const calculateOrdersIncome = (
  zone1: number,
  zone2: number,
  zone3: number,
  priceZone1: number,
  priceZone2: number,
  priceZone3: number,
): number => {
  return Math.round(
    zone1 * priceZone1 + zone2 * priceZone2 + zone3 * priceZone3,
  );
};

/**
 * Step 3: Calculate total income before tax deduction
 */
export const calculateTotalWithTax = (
  timeIncome: number,
  ordersIncome: number,
): number => {
  return timeIncome + ordersIncome;
};

/**
 * Step 4: Apply tax coefficient to get actual earnings
 * CRITICAL: taxCoefficient is applied ONCE here
 */
export const calculateTotalWithoutTax = (
  totalWithTax: number,
  taxCoefficient: number,
): number => {
  return Math.round(totalWithTax * taxCoefficient);
};

/**
 * Step 5: Calculate net profit after fuel costs
 */
export const calculateNetProfit = (
  totalWithoutTax: number,
  fuelCost: number,
): number => {
  return totalWithoutTax - fuelCost;
};

/**
 * Main calculation pipeline
 */
export const calculateShift = (
  params: CalculationParams,
): Omit<ShiftRecord, "date"> => {
  const timeIncome = calculateTimeIncome(params.minutes, params.ratePerMinute);
  const ordersIncome = calculateOrdersIncome(
    params.zone1,
    params.zone2,
    params.zone3,
    params.priceZone1,
    params.priceZone2,
    params.priceZone3,
  );
  const totalWithTax = calculateTotalWithTax(timeIncome, ordersIncome);
  const totalWithoutTax = calculateTotalWithoutTax(
    totalWithTax,
    params.taxCoefficient,
  );
  const netProfit = calculateNetProfit(totalWithoutTax, params.fuelCost);

  return {
    minutes: params.minutes,
    zone1: params.zone1,
    zone2: params.zone2,
    zone3: params.zone3,
    kilometers: params.kilometers,
    fuelCost: params.fuelCost,
    timeIncome,
    ordersIncome,
    totalWithTax,
    totalWithoutTax,
    netProfit,
  };
};
