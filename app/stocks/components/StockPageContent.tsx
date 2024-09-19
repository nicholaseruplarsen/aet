"use client";
import { useState } from 'react';
import MarketsChart from '@/components/chart/MarketsChart';
import FinanceSummaryTable from '@/components/FinanceSummaryTable';
import { StockData } from '@/types/yahoo-finance'; // Import the StockData type

interface StockPageContentProps {
  data: StockData[];
}

export default function StockPageContent({ data }: StockPageContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);

  const handleDateHover = (index: number) => {
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
