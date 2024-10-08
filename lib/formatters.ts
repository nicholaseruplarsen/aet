// stocks/lib/formatters.ts

export const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1e12) {
    return `$${(value / 1e12).toFixed(2)} T`;
  } else if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(2)} B`;
  } else if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)} M`;
  } else {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
};

export const formatPercentage = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  return `${value * 100 >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
};

export const formatMarketCap = formatCurrency;

export const formatPercentageChange = (value: any): string => {
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
