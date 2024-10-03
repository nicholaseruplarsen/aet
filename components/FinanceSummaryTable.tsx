// stocks/components/FinanceSummaryTable.tsx

import React from 'react';
import { cn } from '@/lib/utils'; // Ensure this import is correct
import { FinancialData } from '@/types/'; // Import the FinancialData interface

interface FinanceSummaryTableProps {
  data: FinancialData;
}

// Define the type for financial metrics and ratios
interface Metric {
  key: keyof FinancialData;
  label: string;
  format: 'currency' | 'percentage' | 'number' | 'ratio';
}

const FinanceSummaryTable: React.FC<FinanceSummaryTableProps> = ({ data }) => {
  // Define the financial metrics and ratios separately with proper typing
  const financialMetrics: Metric[] = [
    { key: 'Market Capitalization', label: 'Market Cap', format: 'currency' },
    { key: 'Revenue', label: 'Revenue', format: 'currency' },
    { key: 'Gross Profit', label: 'Gross Income', format: 'currency' },
    { key: 'Gross Margin', label: 'Gross Margin', format: 'percentage' },
    { key: 'Net Income', label: 'Net Income', format: 'currency' },
    { key: 'Profit Margin', label: 'Profit Margin', format: 'percentage' },
    { key: 'Operating Cash Flow', label: 'Operating Cash Flow', format: 'currency' },
    { key: 'Research & Development', label: 'Research & Development', format: 'currency' },
  ];

  const ratios: Metric[] = [
    { key: 'PB Ratio', label: 'PB Ratio', format: 'ratio' },
    { key: 'PS Ratio', label: 'PS Ratio', format: 'ratio' },
    { key: 'P/FCF Ratio', label: 'P/FCF Ratio', format: 'ratio' },
    { key: 'P/OCF Ratio', label: 'P/OCF Ratio', format: 'ratio' },
    { key: 'PE Ratio', label: 'PE Ratio', format: 'ratio' },
    { key: 'Quick Ratio', label: 'Quick Ratio', format: 'ratio' },
    { key: 'EPS (Diluted)', label: 'EPS (Diluted)', format: 'number' },
    { key: 'Debt/Equity', label: 'Debt/Equity', format: 'ratio' },
  ];

  // Define formatting functions
  const formatValue = (value: any, format: string) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'N/A';
    }

    const numValue = Number(value);

    switch (format) {
      case 'currency':
        if (Math.abs(numValue) >= 1e12) {
          return (
            (numValue < 0 ? '-$' : '$') +
            (Math.abs(numValue) / 1e12).toFixed(2) +
            ' T'
          );
        } else if (Math.abs(numValue) >= 1e9) {
          return (
            (numValue < 0 ? '-$' : '$') +
            (Math.abs(numValue) / 1e9).toFixed(2) +
            ' B'
          );
        } else if (Math.abs(numValue) >= 1e6) {
          return (
            (numValue < 0 ? '-$' : '$') +
            (Math.abs(numValue) / 1e6).toFixed(2) +
            ' M'
          );
        } else {
          return (
            (numValue < 0 ? '-$' : '$') + Math.abs(numValue).toLocaleString()
          );
        }
      case 'percentage':
        return (numValue * 100).toFixed(2) + '%';
      case 'number':
        return numValue.toFixed(2);
      case 'ratio':
        return numValue.toFixed(2);
      default:
        return numValue.toString();
    }
  };

  const formatPercentageChange = (value: any) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'N/A';
    }

    const numValue = Number(value);

    if (!isFinite(numValue)) {
      if (numValue === Infinity) return '∞';
      if (numValue === -Infinity) return '-∞';
    }

    return (numValue >= 0 ? '+' : '') + (numValue * 100).toFixed(2) + '%';
  };

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-8">
      {/* Financial Metrics Section */}
      <div className="flex-1">
        <h2 className="mb-4 text-lg font-semibold">Financials (quarterly)</h2>
        <table className="w-full text-left border-collapse table-fixed">
          <colgroup>
            <col />
            <col style={{ width: '8rem' }} />
            <col style={{ width: '6rem' }} />
          </colgroup>
          <tbody>
            {financialMetrics.map((field) => {
              const value = data[field.key];
              const pctChangeKey = `${field.key} Pct Change` as keyof FinancialData; // Type assertion
              const pctChangeValue = data[pctChangeKey];
              const formattedValue = formatValue(value, field.format);
              const formattedPctChange = formatPercentageChange(pctChangeValue);
              const isPositive =
                typeof formattedPctChange === 'string' &&
                !formattedPctChange.startsWith('-') &&
                formattedPctChange !== 'N/A';

              return (
                <tr key={field.key} className="border-b">
                  <td className="py-2 font-medium">{field.label}</td>
                  <td className="py-2 text-left">{formattedValue}</td>
                  <td className="py-2 text-left">
                    <div
                      className={cn(
                        'rounded-md px-2 py-0.5 text-sm font-medium',
                        isPositive
                          ? 'bg-green-200 text-green-800 dark:bg-green-950 dark:text-green-400'
                          : formattedPctChange === 'N/A' ||
                            formattedPctChange === '∞' ||
                            formattedPctChange === '-∞'
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-950 dark:text-gray-400'
                            : 'bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-500'
                      )}
                    >
                      {formattedPctChange}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ratios Section */}
      <div className="flex-1 mt-8 lg:mt-0">
        <h2 className="mb-4 text-lg font-semibold">&nbsp;</h2>
        <table className="w-full text-left border-collapse table-fixed">
          <colgroup>
            <col />
            <col style={{ width: '8rem' }} />
            <col style={{ width: '6rem' }} />
          </colgroup>
          <tbody>
            {ratios.map((field) => {
              const value = data[field.key];
              const pctChangeKey = `${field.key} Pct Change` as keyof FinancialData; // Type assertion
              const pctChangeValue = data[pctChangeKey];
              const formattedValue = formatValue(value, field.format);
              const formattedPctChange = formatPercentageChange(pctChangeValue);
              const isPositive =
                typeof formattedPctChange === 'string' &&
                !formattedPctChange.startsWith('-') &&
                formattedPctChange !== 'N/A';

              return (
                <tr key={field.key} className="border-b">
                  <td className="py-2 font-medium">{field.label}</td>
                  <td className="py-2 text-left">{formattedValue}</td>
                  <td className="py-2 text-left">
                    <div
                      className={cn(
                        'rounded-md px-2 py-0.5 text-sm font-medium',
                        isPositive
                          ? 'bg-green-200 text-green-800 dark:bg-green-950 dark:text-green-400'
                          : formattedPctChange === 'N/A' ||
                            formattedPctChange === '∞' ||
                            formattedPctChange === '-∞'
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-950 dark:text-gray-400'
                            : 'bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-500'
                      )}
                    >
                      {formattedPctChange}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceSummaryTable;
