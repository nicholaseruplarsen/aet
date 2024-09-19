// stocks/types/yahoo-finance.ts

export type PredefinedScreenerModules =
  | "aggressive_small_caps"
  | "conservative_foreign_funds"
  | "day_gainers"
  | "day_losers"
  | "growth_technology_stocks"
  | "high_yield_bond"
  | "most_actives"
  | "most_shorted_stocks"
  | "portfolio_anchors"
  | "small_cap_gainers"
  | "solid_large_growth_funds"
  | "solid_midcap_growth_funds"
  | "top_mutual_funds"
  | "undervalued_growth_stocks"
  | "undervalued_large_caps";

export type Range = "1d" | "1w" | "1m" | "3m" | "1y" | "5y" | "max";

export type Interval =
  | "1m"
  | "2m"
  | "5m"
  | "15m"
  | "30m"
  | "60m"
  | "90m"
  | "1h"
  | "1d"
  | "5d"
  | "1wk"
  | "1mo"
  | "3mo";

// stocks/types/yahoo-finance.ts

export interface StockData {
  Date: string;
  Close: string; // Changed from number to string
  // Define other fields explicitly with correct types
  Market_Capitalization?: string;
  Revenue?: string;
  Gross_Profit?: string;
  Gross_Margin?: string;
  EBITDA?: string;
  Net_Income?: string;
  Profit_Margin?: string;
  EPS_Diluted?: string;
  Debt_Equity?: string;
  Operating_Cash_Flow?: string;
  Research_Development?: string;
  // Remove the index signature if possible for better type safety
}
