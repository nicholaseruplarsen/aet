import { Card, CardContent } from "@/components/ui/card"
import { DEFAULT_INTERVAL, DEFAULT_RANGE } from "@/lib/yahoo-finance/constants"
import {
  validateInterval,
  validateRange,
} from "@/lib/yahoo-finance/fetchChartData"
import { Interval } from "@/types/yahoo-finance"
import { Suspense } from "react"
import type { Metadata } from "next"
import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"

type Props = {
  params: {
    ticker: string
  }
  searchParams?: {
    ticker?: string
    range?: string
    interval?: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = params.ticker

  const quoteData = await fetchQuote(ticker)
  const regularMarketPrice = quoteData.regularMarketPrice?.toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  )

  return {
    title: `${ticker} ${regularMarketPrice}`,
    description: `Stocks page for ${ticker}`,
    keywords: [ticker, "stocks"],
  }
}

// Import necessary modules
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export default async function StocksPage({ params, searchParams }: Props) {
  const ticker = params.ticker;
  // Read the CSV file
  const csvFilePath = path.join(process.cwd(), 'data', `${ticker}_with_all.csv`);
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  });
  // Pass the data to a client component
  return (
    <div>
      <Card>
        <CardContent className="space-y-10 pt-6 lg:px-40 lg:py-14">
          <Suspense fallback={<div>Loading...</div>}>
            <StockPageContent data={records} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

