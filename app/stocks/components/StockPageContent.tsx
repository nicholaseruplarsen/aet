// stocks/app/stocks/components/StockPageContent.tsx

"use client";
import { useState } from 'react';
import MarketsChart from '@/components/chart/MarketsChart';
import FinanceSummaryTable from '@/components/FinanceSummaryTable';
import { StockData } from '@/types/'; // Import the StockData type

interface StockPageContentProps {
  data: StockData[];
  financialData: Record<string, any>; // Now represents all financial data mapped by date
}

export default function StockPageContent({ data, financialData }: StockPageContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);

  const handleDateHover = (index: number) => {
    setSelectedIndex(index);
  };

  const selectedData = data[selectedIndex];
  
  // Format the selected date to 'YYYY-MM-DD' to match financialData keys
  const selectedDateKey = new Date(selectedData.date).toISOString().split('T')[0];
  const selectedFinancialDataForDate = financialData[selectedDateKey] || {};

  return (
    <div className="space-y-6">
      <MarketsChart data={data} onDateHover={handleDateHover} />
      <FinanceSummaryTable data={selectedFinancialDataForDate} />
    </div>
  );
}
