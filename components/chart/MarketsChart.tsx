// stocks/components/chart/MarketsChart.tsx

"use client";
import AreaClosedChart from './AreaClosedChart';
import { StockData } from '@/types/';

interface MarketsChartProps {
  data: StockData[];
  onDateHover: (index: number) => void;
  ticker: string;
  companyName: string;
}

export default function MarketsChart({
  data,
  onDateHover,
  ticker,
  companyName,
}: MarketsChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date),
    close: item.close,
    marketCap: item.marketCap,
  }));

  return (
    <div>
      {/* Display Ticker and Company Name */}
      <div className="space-x-1 text-muted-foreground">
        <span className="font-normal text-primary">
          {companyName} ({ticker})
        </span>
      </div>

      <AreaClosedChart data={chartData} onDateHover={onDateHover} />
    </div>
  );
}
