// components/FinanceSummaryTable.tsx
import React from 'react';

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
      if (Math.abs(numValue) >= 1e9) {
        return (numValue < 0 ? '-$' : '$') + (Math.abs(numValue) / 1e9).toFixed(2) + ' B';
      } else if (Math.abs(numValue) >= 1e6) {
        return (numValue < 0 ? '-$' : '$') + (Math.abs(numValue) / 1e6).toFixed(2) + ' M';
      } else {
        return (numValue < 0 ? '-$' : '$') + Math.abs(numValue).toLocaleString();
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

  return (
    <table className="w-full text-left border-collapse">
      <tbody>
        {fields.map((field) => (
          <tr key={field.key} className="border-b">
            <td className="py-2 font-medium">{field.label}</td>
            <td className="py-2 text-right">
              {formatValue(data[field.key], field.format)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FinanceSummaryTable;
