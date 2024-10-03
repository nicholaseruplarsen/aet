// stocks/components/chart/MarketsChart.tsx

"use client";
import AreaClosedChart from './AreaClosedChart';
import { StockData } from '@/types/'; // Ensure this import is correct

interface MarketsChartProps {
  data: StockData[];
  onDateHover: (index: number) => void;
}

export default function MarketsChart({ data, onDateHover }: MarketsChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date),
    close: item.close,
    marketCap: item.marketCap, // Include marketCap
  }));

  return (
    <div>
      {/* Hardcoded Ticker Information */}
      <div className="space-x-1 text-muted-foreground">
        <span className="font-normal text-primary">Apple Inc. (AAPL)</span>
      </div>

      <AreaClosedChart data={chartData} onDateHover={onDateHover} />
    </div>
  );
}
