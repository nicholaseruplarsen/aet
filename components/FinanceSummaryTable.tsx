// stocks/components/FinanceSummaryTable.tsx

import React, { memo } from 'react';
import { cn } from '@/lib/utils'; // Ensure this import is correct
import { FinancialData } from '@/types/'; // Import the FinancialData interface
import { formatCurrency, formatPercentage, formatPercentageChange } from '@/lib/formatters';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'; // Import Tooltip components

interface FinanceSummaryTableProps {
  data: FinancialData;
}

// Define the type for financial metrics and ratios
interface Metric {
  key: keyof FinancialData;
  label: string;
  format: 'currency' | 'percentage' | 'number' | 'ratio';
  tooltip: string; // New property for tooltip text
}

const FinanceSummaryTable = memo(({ data }: FinanceSummaryTableProps) => {
  const financialMetrics: Metric[] = [
    {
      key: 'Market Capitalization',
      label: 'Market Cap',
      format: 'currency',
      tooltip: 'Market Cap: Outstanding Shares × Current Share Price',
    },
    {
      key: 'Revenue',
      label: 'Revenue',
      format: 'currency',
      tooltip: 'Total income generated from sales before any expenses',
    },
    {
      key: 'Gross Profit',
      label: 'Gross Income',
      format: 'currency',
      tooltip: 'Gross Profit: Revenue - Cost of Goods Sold',
    },
    {
      key: 'Net Income',
      label: 'Net Income',
      format: 'currency',
      tooltip: 'Net Income: Revenue - All Expenses',
    },
    {
      key: 'Operating Cash Flow',
      label: 'Operating Cash Flow',
      format: 'currency',
      tooltip: 'Cash generated from regular business operations',
    },
    {
      key: 'Research & Development',
      label: 'Research & Development',
      format: 'currency',
      tooltip: 'Expenses related to developing new products or services',
    },
    // **New Metric**
    {
      key: 'Present Value of Future Cash Flows',
      label: 'PV of Future Cash Flows',
      format: 'currency',
      tooltip: 'Present Value of Future Cash Flows: Calculated using the Gordon Growth Model',
    },
  ];

  const ratios: Metric[] = [
    {
      key: 'PB Ratio',
      label: 'PB Ratio',
      format: 'ratio',
      tooltip: 'Price-to-Book ratio: Market Cap / Shareholders Equity',
    },
    {
      key: 'PS Ratio',
      label: 'PS Ratio',
      format: 'ratio',
      tooltip: 'Price-to-Sales ratio: Market Cap / Revenue',
    },
    {
      key: 'PE Ratio',
      label: 'PE Ratio',
      format: 'ratio',
      tooltip: 'Price-to-Earnings ratio: Market Cap / Net Income',
    },
    {
      key: 'Quick Ratio',
      label: 'Quick Ratio',
      format: 'ratio',
      tooltip: 'Quick Ratio: (Total Current Assets - Inventory) / Total Current Liabilities',
    },
    {
      key: 'EPS (Diluted)',
      label: 'EPS (Diluted)',
      format: 'number',
      tooltip: 'Earnings Per Share (Diluted): (Net Income - Preferred Dividends) / Weighted Average Diluted Shares Outstanding',
    },
    {
      key: 'Debt/Equity',
      label: 'Debt/Equity',
      format: 'ratio',
      tooltip: 'Debt-to-Equity ratio: Total Debt / Shareholders Equity',
    },
  ];

  // Define formatting functions
  const formatValue = (value: any, format: string) => {
    if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
      return 'N/A';
    }

    const numValue = typeof value === 'number' ? value : parseFloat(value.toString());

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
        return numValue.toFixed(2) + 'x'; // Appended 'x' for ratios
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
                  <td className="py-2 font-medium">
                    {/* Wrap the label with Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* Change to flex container for alignment */}
                        <span className="cursor-default flex justify-between items-center">
                          <span>{field.label}</span>
                          {/* Conditionally render the margin spans with added padding-right */}
                          {field.key === 'Gross Profit' && data['Gross Margin'] !== undefined && (
                            <span className="ml-2 text-sm text-gray-500 text-right pr-2">
                              ({formatValue(data['Gross Margin'], 'percentage')})
                            </span>
                          )}
                          {field.key === 'Net Income' && data['Profit Margin'] !== undefined && (
                            <span className="ml-2 text-sm text-gray-500 text-right pr-2">
                              ({formatValue(data['Profit Margin'], 'percentage')})
                            </span>
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {field.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </td>
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
        <h2 className="mb-4 text-lg font-semibold">Ratios</h2>
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
                  <td className="py-2 font-medium">
                    {/* Wrap the label with Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">
                          {field.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {field.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </td>
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
});

// Assign displayName
FinanceSummaryTable.displayName = 'FinanceSummaryTable';

export default FinanceSummaryTable;
