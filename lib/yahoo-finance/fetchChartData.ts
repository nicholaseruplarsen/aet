import type {
  ChartOptions,
  ChartResultArray,
} from "@/node_modules/yahoo-finance2/dist/esm/src/modules/chart"
import type { Interval, Range } from "@/types/yahoo-finance"
import { DEFAULT_RANGE, INTERVALS_FOR_RANGE, VALID_RANGES } from "./constants"
import { CalculateRange } from "@/lib/utils"
import yahooFinance from "yahoo-finance2"

export const validateRange = (range: string): Range =>
  VALID_RANGES.includes(range as Range) ? (range as Range) : DEFAULT_RANGE

export const validateInterval = (range: Range, interval: Interval): Interval =>
  INTERVALS_FOR_RANGE[range].includes(interval)
    ? interval
    : INTERVALS_FOR_RANGE[range][0]

export async function fetchChartData(
  symbol: string,
  range: Range,
  interval: Interval
) {
  try {
    let chartInterval: string;
    switch (range) {
      case "1d":
        chartInterval = "5m";
        break;
      case "1w":
        chartInterval = "30m";
        break;
      case "1m":
        chartInterval = "1d";
        break;
      case "3m":
        chartInterval = "1d";
        break;
      case "1y":
        chartInterval = "1wk";
        break;
      case "5y":
        chartInterval = "1mo"; // Correctly handled
        break;
      case "max":
        chartInterval = "1mo";
        break;
      default:
        chartInterval = "1d";
    }

    const result = await yahooFinance.chart(symbol, {
      period1: getStartDate(range),
      interval: chartInterval as Interval,
    });

    return result;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    throw error;
  }
}
    
function getStartDate(range: Range): Date {
  const now = new Date();
  switch (range) {
    case "1d":
      return new Date(now.setDate(now.getDate() - 1));
    case "1w":
      return new Date(now.setDate(now.getDate() - 7));
    case "1m":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "3m":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "5y":
      return new Date(now.setFullYear(now.getFullYear() - 5));
    case "max":
      return new Date(0); // Beginning of time
    default:
      return new Date(now.setDate(now.getDate() - 1));
  }
}