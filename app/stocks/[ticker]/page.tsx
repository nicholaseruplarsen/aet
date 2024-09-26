// stocks/app/stocks/[ticker]/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import StockPageContent from "@/app/stocks/components/StockPageContent";
import path from 'path';
import { promises as fs } from 'fs';

type Props = {
  params: {
    ticker: string;
  };
  searchParams?: {
    ticker?: string;
    range?: string;
    interval?: string;
  };
};

export default async function StocksPage({ params, searchParams }: Props) {
  const ticker = params.ticker;

  // Fetch stock data
  const stockDataPath = path.join(process.cwd(), 'public', 'data', 'stockData.json');
  const stockDataRaw = await fs.readFile(stockDataPath, 'utf8');
  const stockData = JSON.parse(stockDataRaw);

  // Fetch financial statements
  const financialStatementsPath = path.join(process.cwd(), 'public', 'data', 'financialStatements.json');
  const financialStatementsRaw = await fs.readFile(financialStatementsPath, 'utf8');
  const financialStatements = JSON.parse(financialStatementsRaw);

  return (
    <div>
      <Card>
        <CardContent className="space-y-10 pt-6 lg:px-40 lg:py-14">
          <Suspense fallback={<div>Loading...</div>}>
            <StockPageContent data={stockData} financialData={financialStatements} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// Add the generateStaticParams function
export async function generateStaticParams() {
  const tickersPath = path.join(process.cwd(), 'public', 'data', 'tickers.json');
  const tickersRaw = await fs.readFile(tickersPath, 'utf8');
  const tickers: string[] = JSON.parse(tickersRaw);

  return tickers.map((ticker) => ({
    ticker,
  }));
}
