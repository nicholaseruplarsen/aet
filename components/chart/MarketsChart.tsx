// components/chart/MarketsChart.tsx
"use client";
import AreaClosedChart from './AreaClosedChart';

export default function MarketsChart({ data, onDateHover }) {
  const chartData = data.map((item) => ({
    date: new Date(item.Date),
    close: parseFloat(item.Close),
  }));

  return (
    <div>
      <AreaClosedChart data={chartData} onDateHover={onDateHover} />
    </div>
  );
}
