// stocks/app/stocks/[ticker]/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import StockPageContent from "@/app/stocks/components/StockPageContent";
import path from 'path';
import { promises as fs } from 'fs';
import { getStockData, getFinancialStatements } from '@/lib/dataCache';

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

  const stockData = await getStockData();
  const financialStatements = await getFinancialStatements();

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
