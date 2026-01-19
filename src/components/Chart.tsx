import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartDataPoint {
  date: string;
  income?: number;
  netProfit?: number;
  kilometers?: number;
}

interface EarningsChartProps {
  data: ChartDataPoint[];
  type?: "line" | "bar";
  showNetProfit?: boolean;
  height?: number;
}

export function EarningsChart({
  data,
  type = "line",
  showNetProfit = false,
  height = 300,
}: EarningsChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString("ru-RU", {
      month: "short",
      day: "numeric",
    }),
  }));

  const ChartComponent = type === "bar" ? BarChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 12 }}
          interval={Math.max(0, Math.floor(chartData.length / 7))}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value?: number) =>
            value ? `₽${value.toLocaleString("ru-RU")}` : ""
          }
          labelFormatter={(label: string) => `${label}`}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />
        <Legend />
        {type === "bar" ? (
          <>
            <Bar dataKey="income" fill="#3b82f6" name="Доход" />
            {showNetProfit && (
              <Bar dataKey="netProfit" fill="#10b981" name="Чистая прибыль" />
            )}
          </>
        ) : (
          <>
            <Line
              type="monotone"
              dataKey="income"
              stroke="#3b82f6"
              dot={false}
              name="Доход"
              strokeWidth={2}
            />
            {showNetProfit && (
              <Line
                type="monotone"
                dataKey="netProfit"
                stroke="#10b981"
                dot={false}
                name="Чистая прибыль"
                strokeWidth={2}
              />
            )}
          </>
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}

interface KilometersChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function KilometersChart({ data, height = 250 }: KilometersChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString("ru-RU", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 12 }}
          interval={Math.max(0, Math.floor(chartData.length / 7))}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value?: number) => (value ? `${value} км` : "")}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />
        <Bar dataKey="kilometers" fill="#f59e0b" name="Километры" />
      </BarChart>
    </ResponsiveContainer>
  );
}
