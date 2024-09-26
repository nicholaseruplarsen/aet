// stocks/app/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import StockPageContent from '@/app/stocks/components/StockPageContent';
import path from 'path';
import { promises as fs } from 'fs';

export default async function Home() {
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
