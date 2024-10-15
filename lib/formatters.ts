// stocks/lib/formatters.ts

export const formatCurrency = (value: number | string): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 'N/A';
  }

  const numValue = typeof value === 'number' ? value : parseFloat(value.toString());

  if (Math.abs(numValue) >= 1e12) {
    return `$${(numValue / 1e12).toFixed(2)} T`;
  } else if (Math.abs(numValue) >= 1e9) {
    return `$${(numValue / 1e9).toFixed(2)} B`;
  } else if (Math.abs(numValue) >= 1e6) {
    return `$${(numValue / 1e6).toFixed(2)} M`;
  } else {
    return `$${numValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
};

export const formatPercentage = (value: number | string): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }
  return `${Number(value) * 100 >= 0 ? "+" : ""}${(Number(value) * 100).toFixed(2)}%`;
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
