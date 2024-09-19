// stocks/app/stocks/components/StockPageContent.tsx
"use client";
import { useState } from 'react';
import MarketsChart from '@/components/chart/MarketsChart';
import FinanceSummaryTable from '@/components/FinanceSummaryTable';

export default function StockPageContent({ data }) {
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);

  const handleDateHover = (index) => {
    setSelectedIndex(index);
  };

  const selectedData = data[selectedIndex];

  return (
    <div className="space-y-6">
      <MarketsChart data={data} onDateHover={handleDateHover} />
      <FinanceSummaryTable data={selectedData} />
    </div>
  );
}
