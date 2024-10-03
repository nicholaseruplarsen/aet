// lib/yahoo-finance/constants.ts

export const VALID_RANGES = ["1d", "1w", "1m", "3m", "1y", "5y", "20y", "10y", "max"] as const;

export type Range = typeof VALID_RANGES[number];

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

// Update in constants.ts or wherever INTERVALS_FOR_RANGE is defined
export const INTERVALS_FOR_RANGE: Record<Range, readonly Interval[]> = {
  "1d": ["1m", "2m", "5m", "15m", "30m", "1h"],
  "1w": ["5m", "15m", "30m", "1h", "1d"],
  "1m": ["30m", "1h", "1d"],
  "3m": ["1h", "1d"],
  "1y": ["1d", "1wk"],
  "5y": ["1mo"],
  "10y": ["1mo"],
  "20y": ["1mo"],
  "max": ["1mo"],
} as const;

// Other constants
export const DEFAULT_TICKER = "AAPL";
export const DEFAULT_RANGE: Range = "max";
export const DEFAULT_INTERVAL = "1m";
export const DEFAULT_SCREENER = "most_actives";
