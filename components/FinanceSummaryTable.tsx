// components/FinanceSummaryTable.tsx
import React from 'react';
import { cn } from '@/lib/utils'; // Import the class name utility

interface FinanceSummaryTableProps {
  data: any;
}

const FinanceSummaryTable: React.FC<FinanceSummaryTableProps> = ({ data }) => {
  const fields = [
    { key: 'Market Capitalization', label: 'Market Cap', format: 'currency' },
    { key: 'Revenue', label: 'Revenue', format: 'currency' },
    { key: 'Gross Profit', label: 'Gross Income', format: 'currency' },
    { key: 'Gross Margin', label: 'Gross Margin', format: 'percentage' },
    { key: 'EBITDA', label: 'EBITDA', format: 'currency' },
    { key: 'Net Income', label: 'Net Income', format: 'currency' },
    { key: 'Profit Margin', label: 'Profit Margin', format: 'percentage' },
    { key: 'EPS (Diluted)', label: 'EPS (Diluted)', format: 'number' },
    { key: 'Debt/Equity', label: 'Debt/Equity', format: 'ratio' },
    { key: 'Operating Cash Flow', label: 'Operating Cash Flow', format: 'currency' },
    { key: 'Research & Development', label: 'Research & Development', format: 'currency' },
  ];

  const formatValue = (value: any, format: string) => {
    if (value === null || value === undefined || isNaN(value)) {
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
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    const numValue = Number(value) * 100;
    return (numValue >= 0 ? '+' : '') + numValue.toFixed(2) + '%';
  };

  return (
    <table className="w-full text-left border-collapse table-fixed">
      <colgroup>
        <col />
        <col style={{ width: '8rem' }} />
        <col style={{ width: '6rem' }} />
      </colgroup>
      <tbody>
        {fields.map((field) => {
          const value = data[field.key];
          const pctChangeKey = field.key + ' Pct Change';
          const pctChangeValue = data[pctChangeKey];
          const formattedValue = formatValue(value, field.format);
          const formattedPctChange = formatPercentageChange(pctChangeValue);
          const isPositive = Number(pctChangeValue) >= 0;

          return (
            <tr key={field.key} className="border-b">
              <td className="py-2 font-medium">{field.label}</td>
              <td className="py-2 text-left">
                {formattedValue}
              </td>
              <td className="py-2 text-left">
                <div
                  className={cn(
                    'rounded-md px-2 py-0.5',
                    isPositive
                      ? 'bg-green-200 text-green-800 dark:bg-green-950 dark:text-green-400'
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
  );
};

export default FinanceSummaryTable;
