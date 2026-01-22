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
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="currentColor"
    >
      <path d="M14.5,15c4.136,0,7.5-3.364,7.5-7.5S18.636,0,14.5,0h-5c-2.481,0-4.5,2.019-4.5,4.5V14H2.5c-.276,0-.5,.224-.5,.5s.224,.5,.5,.5h2.5v3H2.5c-.276,0-.5,.224-.5,.5s.224,.5,.5,.5h2.5v4.59c0,.276,.224,.5,.5,.5s.5-.224,.5-.5v-4.59H15.5c.276,0,.5-.224,.5-.5s-.224-.5-.5-.5H6v-3H14.5ZM6,4.5c0-1.93,1.57-3.5,3.5-3.5h5c3.584,0,6.5,2.916,6.5,6.5s-2.916,6.5-6.5,6.5H6V4.5Z" />
    </svg>
  ),
  kilometers: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="m18.5,10c.276,0,.5-.224.5-.5v-3.191l4.348-2.175c.408-.28.652-.757.652-1.276s-.243-.996-.652-1.277c-.025-.017-3.276-1.46-3.474-1.52-.438-.133-.9-.049-1.271.227-.378.281-.604.728-.604,1.197v8.016c0,.276.224.5.5.5Zm.5-8.516c0-.154.074-.301.199-.394.052-.038.144-.091.264-.091.038,0,.433.124.584.191l2.764,1.237c.119.097.189.255.189.43,0,.188-.082.357-.159.417l-3.841,1.917V1.484Zm5,17.016c0,1.93-1.57,3.5-3.5,3.5h-6c-.276,0-.5-.224-.5-.5s.224-.5.5-.5h6c1.379,0,2.5-1.122,2.5-2.5s-1.121-2.5-2.5-2.5h-8c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5h3c.276,0,.5.224.5.5s-.224.5-.5.5h-3c-1.378,0-2.5,1.122-2.5,2.5s1.122,2.5,2.5,2.5h8c1.93,0,3.5,1.57,3.5,3.5Zm-14-.5h-.93l-1.258-1.887c-.465-.697-1.242-1.113-2.08-1.113h-3.232c-1.378,0-2.5,1.122-2.5,2.5v2.5c0,.771.443,1.434,1.084,1.768-.05.157-.084.317-.084.482,0,.965.785,1.75,1.75,1.75s1.75-.785,1.75-1.75c0-.086-.03-.166-.044-.25h2.088c-.013.084-.044.164-.044.25,0,.965.785,1.75,1.75,1.75s1.75-.785,1.75-1.75c0-.086-.03-.166-.044-.25h.044c1.103,0,2-.897,2-2s-.897-2-2-2Zm-7.5-2h3.232c.502,0,.969.25,1.248.668l.888,1.332H1v-.5c0-.827.673-1.5,1.5-1.5Zm1,6.25c0,.414-.336.75-.75.75s-.75-.336-.75-.75c0-.084.018-.167.054-.25h1.392c.036.083.054.166.054.25Zm5.5,0c0,.414-.336.75-.75.75s-.75-.336-.75-.75c0-.084.018-.167.054-.25h1.392c.036.083.054.166.054.25Zm1-1.25H2c-.551,0-1-.449-1-1v-1h9c.551,0,1,.449,1,1s-.449,1-1,1Z" />
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
