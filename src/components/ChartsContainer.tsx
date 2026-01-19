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

export function ChartsContainer({ data }: ChartsContainerProps) {
  return (
    <>
      {data.length > 0 && (
        <>
          <Card variant="elevated" className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📈 Доход за период
            </h3>
            <EarningsChart
              data={data}
              type="line"
              showNetProfit={true}
              height={300}
            />
          </Card>

          <Card variant="elevated" className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🚗 Пройденные километры
            </h3>
            <KilometersChart data={data} height={250} />
          </Card>
        </>
      )}
    </>
  );
}
