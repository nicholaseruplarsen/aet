// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Interval } from "@/types"; // Now correctly imported

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStartDate(interval: Interval) {
  const today = new Date();
  let subtractDays;

  switch (interval) {
    case "1d":
    case "1m":
    case "2m":
    case "5m":
    case "15m":
    case "30m":
    case "60m":
    case "90m":
    case "1h":
      subtractDays = 1;
      break;
    case "5d":
      subtractDays = 5;
      break;
    case "1wk":
      subtractDays = 7;
      break;
    case "1mo":
      subtractDays = 30;
      break;
    case "3mo":
      subtractDays = 90;
      break;
    default:
      subtractDays = 0;
  }

  today.setDate(today.getDate() - subtractDays);

  // Format the date in the 'YYYY-MM-DD' format
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
