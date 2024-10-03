// stocks/lib/dataCache.ts

import path from 'path';
import { promises as fs } from 'fs';
import { StockData, FinancialData } from '@/types';

// In-memory caches
let stockDataCache: StockData[] | null = null;
let financialStatementsCache: Record<string, FinancialData> | null = null;

/**
 * Fetch and cache stock data.
 * @returns Promise resolving to an array of StockData
 */
export async function getStockData(): Promise<StockData[]> {
  if (!stockDataCache) {
    const stockDataPath = path.join(process.cwd(), 'public', 'data', 'stockData.json');
    const stockDataRaw = await fs.readFile(stockDataPath, 'utf8');
    stockDataCache = JSON.parse(stockDataRaw) as StockData[];
  }
  return stockDataCache;
}

/**
 * Fetch and cache financial statements.
 * @returns Promise resolving to a Record of FinancialData
 */
export async function getFinancialStatements(): Promise<Record<string, FinancialData>> {
  if (!financialStatementsCache) {
    const financialStatementsPath = path.join(process.cwd(), 'public', 'data', 'financialStatements.json');
    const financialStatementsRaw = await fs.readFile(financialStatementsPath, 'utf8');
    financialStatementsCache = JSON.parse(financialStatementsRaw) as Record<string, FinancialData>;
  }
  return financialStatementsCache;
}
