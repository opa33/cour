import { EarningsChart, KilometersChart } from "./Chart";
import Card from "./Card";

interface ChartData {
  date: string;
  income?: number;
  netProfit?: number;
  kilometers?: number;
}

interface ChartsContainerProps {
  data: ChartData[];
}

// Icons as SVG components
const ChartIcons = {
  earnings: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  kilometers: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <path d="M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0" />
      <path d="M12 5v7l4 2" />
    </svg>
  ),
};

export function ChartsContainer({ data }: ChartsContainerProps) {
  return (
    <>
      {data.length > 0 && (
        <div className="space-y-6">
          <Card variant="elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                {ChartIcons.earnings}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Доход за период
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Динамика доходов и чистой прибыли
                </p>
              </div>
            </div>
            <div className="mt-4">
              <EarningsChart
                data={data}
                type="line"
                showNetProfit={true}
                height={300}
              />
            </div>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
                {ChartIcons.kilometers}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Пройденные километры
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Статистика по дням
                </p>
              </div>
            </div>
            <div className="mt-4">
              <KilometersChart data={data} height={250} />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
