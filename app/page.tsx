// stocks/app/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import StockPageContent from '@/app/stocks/components/StockPageContent';
import { getStockData, getFinancialStatements } from '@/lib/dataCache';

export default async function Home() {
  const stockData = await getStockData();
  const financialStatements = await getFinancialStatements();

  return (
    <div className="lg:px-20">
      <Card>
        <CardContent className="lg:px-14 lg:py-14">
          <Suspense fallback={<div>Loading...</div>}>
            <StockPageContent data={stockData} financialData={financialStatements} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
