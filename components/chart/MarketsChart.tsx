"use client";
import AreaClosedChart from './AreaClosedChart';
import { StockData } from '@/types/yahoo-finance'; // Import the StockData type

// Define an interface for the component's props
interface MarketsChartProps {
  data: StockData[];
  onDateHover: (index: number) => void;
}

// Apply the props interface to the component
export default function MarketsChart({ data, onDateHover }: MarketsChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.Date),
    close: parseFloat(item.Close),
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
