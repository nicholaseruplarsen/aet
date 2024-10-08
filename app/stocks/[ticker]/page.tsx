// stocks/app/stocks/[ticker]/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import StockPageContent from "@/app/stocks/components/StockPageContent";
import path from 'path';
import { promises as fs } from 'fs';
import { getStockData, getFinancialStatements } from '@/lib/dataCache';
import { notFound } from 'next/navigation'; // Import notFound

type Props = {
  params: {
    ticker: string;
  };
};

export default async function StocksPage({ params }: Props) {
  const ticker = params.ticker.toUpperCase();

  // Fetch data specific to the ticker
  const stockData = await getStockData(ticker);
  const financialStatements = await getFinancialStatements(ticker);

  // If data is missing, return a 404 page
  if (!stockData || !financialStatements) {
    notFound();
  }

  // Load tickers.json to get the company name
  const tickersPath = path.join(process.cwd(), 'public', 'data', 'tickers.json');
  const tickersRaw = await fs.readFile(tickersPath, 'utf8');
  const tickersArray: { id: number; ticker: string; title: string }[] = JSON.parse(tickersRaw);
  const tickerEntry = tickersArray.find(t => t.ticker === ticker);
  const companyName = tickerEntry ? tickerEntry.title : ticker;

  return (
    <div className="lg:px-20">
      <Card>
        <CardContent className="lg:px-10 lg:py-7">
          <Suspense fallback={<div>Loading...</div>}>
            <StockPageContent
              data={stockData}
              financialData={financialStatements}
              ticker={ticker}
              companyName={companyName}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
  const tickersPath = path.join(process.cwd(), 'public', 'data', 'tickers.json');
  const tickersRaw = await fs.readFile(tickersPath, 'utf8');
  const tickersArray: { id: number; ticker: string; title: string }[] = JSON.parse(tickersRaw);
  const tickers = tickersArray.map((item) => item.ticker);

  return tickers.map((ticker) => ({
    ticker,
  }));
}
