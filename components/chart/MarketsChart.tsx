// stocks/components/chart/MarketsChart.tsx
"use client";
import AreaClosedChart from './AreaClosedChart';

export default function MarketsChart({ data, onDateHover }) {
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
