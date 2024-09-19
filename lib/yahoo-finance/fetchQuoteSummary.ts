import yahooFinance from "yahoo-finance2"

export async function fetchQuoteSummary(ticker: string) {

  try {
    const response = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "defaultKeyStatistics"],
    })

    return response
  } catch (error) {
    console.log("Failed to fetch quote summary", error)
    throw new Error("Failed to fetch quote summary.")
  }
}
