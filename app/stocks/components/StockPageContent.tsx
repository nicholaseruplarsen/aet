// stocks/app/stocks/components/StockPageContent.tsx

"use client";
import { useState, useEffect, useMemo } from 'react';
import MarketsChart from '@/components/chart/MarketsChart';
import FinanceSummaryTable from '@/components/FinanceSummaryTable';
import { StockData } from '@/types/';
import { Button } from '@/components/ui/button';

interface StockPageContentProps {
  data: StockData[];
  financialData: Record<string, any>;
  ticker: string;
  companyName: string;
}

export default function StockPageContent({
  data,
  financialData,
  ticker,
  companyName,
}: StockPageContentProps) {
  const [selectedRange, setSelectedRange] = useState<string>('MAX');

  // Memoize filteredData to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    if (selectedRange.toUpperCase() === 'MAX') {
      return data;
    }

    const yearsAgo = parseInt(selectedRange.replace('Y', ''), 10);
    if (isNaN(yearsAgo)) {
      return data;
    }

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsAgo);

    return data.filter(item => new Date(item.date) >= cutoffDate);
  }, [selectedRange, data]);

  // Initialize selectedIndex based on filteredData
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() => 
    filteredData.length > 0 ? filteredData.length - 1 : null
  );

  // Update selectedIndex whenever filteredData changes
  useEffect(() => {
    setSelectedIndex(filteredData.length > 0 ? filteredData.length - 1 : null);
  }, [filteredData]);

  const handleDateHover = (index: number) => {
    if (index >= 0 && index < filteredData.length) {
      setSelectedIndex(index);
    }
  };

  // If there's no data available for the selected range
  if (filteredData.length === 0 || selectedIndex === null) {
    return (
      <div className="space-y-6">
        {/* Buttons for selecting range */}
        <div className="flex space-x-2 justify-center">
          {['MAX', '20Y', '10Y', '5Y', '3Y', '1Y'].map(range => (
            <Button
              key={range}
              onClick={() => setSelectedRange(range)}
              variant={selectedRange === range ? 'default' : 'outline'}
            >
              {range}
            </Button>
          ))}
        </div>
        <div className="text-center mt-4">No data available for the selected range.</div>
      </div>
    );
  }

  const selectedData = filteredData[selectedIndex];

  // Ensure selectedData is defined
  if (!selectedData) {
    return (
      <div className="space-y-6">
        {/* Buttons for selecting range */}
        <div className="flex space-x-2 justify-center">
          {['MAX', '20Y', '10Y', '5Y', '3Y', '1Y'].map(range => (
            <Button
              key={range}
              onClick={() => setSelectedRange(range)}
              variant={selectedRange === range ? 'default' : 'outline'}
            >
              {range}
            </Button>
          ))}
        </div>
        <div className="text-center mt-4">No data available for the selected range.</div>
      </div>
    );
  }

  // Format the selected date to 'YYYY-MM-DD' to match financialData keys
  const selectedDateKey = new Date(selectedData.date).toISOString().split('T')[0];
  const selectedFinancialDataForDate = financialData[selectedDateKey] || {};

  return (
    <div className="space-y-6">
      <MarketsChart
        data={filteredData}
        onDateHover={handleDateHover}
        ticker={ticker}
        companyName={companyName}
      />

      {/* Buttons for selecting range */}
      <div className="flex space-x-2 justify-center">
        {['MAX', '20Y', '10Y', '5Y', '3Y', '1Y'].map(range => (
          <Button
            key={range}
            onClick={() => setSelectedRange(range)}
            variant={selectedRange === range ? 'default' : 'outline'}
          >
            {range}
          </Button>
        ))}
      </div>

      <FinanceSummaryTable data={selectedFinancialDataForDate} />
    </div>
  );
}
