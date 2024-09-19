// stocks/app/page.tsx
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import StockPageContent from '@/app/stocks/components/StockPageContent';

export default async function Home() {
  // Read the CSV file
  const csvFilePath = path.join(process.cwd(), 'data', 'AAPL_with_all.csv');
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  });

  // Pass the data to the client component
  return (
    <div>
      <StockPageContent data={records} />
    </div>
  );
}
