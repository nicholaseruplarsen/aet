// stocks/lib/yahoo-finance/fetchQuote.ts

import yahooFinance from "yahoo-finance2"

export async function fetchQuote(ticker: string) {
  try {
    const response = await yahooFinance.quote(ticker)
    return response
  } catch (error) {
    console.log("Failed to fetch stock quote", error)
    throw new Error("Failed to fetch stock quote.")
  }
}
