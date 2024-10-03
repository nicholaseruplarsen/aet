// stocks/types/index.ts

export interface StockData {
  date: string;
  close: number;
  marketCap: number; // Added Market Capitalization
}

export interface FinancialData {
  // Existing financial fields
  'Market Capitalization'?: number | string;
  'Revenue'?: number | string;
  'Gross Profit'?: number | string;
  'Gross Margin'?: number | string;
  'Net Income'?: number | string;
  'Profit Margin'?: number | string;
  'EPS (Diluted)'?: number | string;
  'Debt/Equity'?: number | string;
  'Operating Cash Flow'?: number | string;
  'Research & Development'?: number | string;

  // New financial fields
  'PE Ratio'?: number | string;
  'PS Ratio'?: number | string;
  'PB Ratio'?: number | string;
  'P/FCF Ratio'?: number | string;
  'P/OCF Ratio'?: number | string;
  'Quick Ratio'?: number | string;

  // Corresponding 'Pct Change' fields
  'Market Capitalization Pct Change'?: number | string;
  'Revenue Pct Change'?: number | string;
  'Gross Profit Pct Change'?: number | string;
  'Gross Margin Pct Change'?: number | string;
  'Net Income Pct Change'?: number | string;
  'Profit Margin Pct Change'?: number | string;
  'EPS (Diluted) Pct Change'?: number | string;
  'Debt/Equity Pct Change'?: number | string;
  'Operating Cash Flow Pct Change'?: number | string;
  'Research & Development Pct Change'?: number | string;

  // New 'Pct Change' fields
  'PE Ratio Pct Change'?: number | string;
  'PS Ratio Pct Change'?: number | string;
  'PB Ratio Pct Change'?: number | string;
  'P/FCF Ratio Pct Change'?: number | string;
  'P/OCF Ratio Pct Change'?: number | string;
  'Quick Ratio Pct Change'?: number | string;
}

// Re-export Interval type for centralized access
export type { Interval } from "./intervals";
