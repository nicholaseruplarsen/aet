import type { Interval, Range } from "@/types/yahoo-finance"

export const DEFAULT_TICKER = "AAPL"
export const DEFAULT_RANGE: Range = "max";
export const DEFAULT_INTERVAL = "1m"
export const DEFAULT_SCREENER = "most_actives"

export const VALID_RANGES = ["1d", "1w", "1m", "3m", "1y", "max"] as const

export const INTERVALS_FOR_RANGE: Record<Range, readonly Interval[]> = {
  "1d": ["1m", "2m", "5m", "15m", "30m", "1h"],
  "1w": ["5m", "15m", "30m", "1h", "1d"],
  "1m": ["30m", "1h", "1d"],
  "3m": ["1h", "1d"],
  "1y": ["1d", "1wk"],
  "max": ["1mo"],
} as const