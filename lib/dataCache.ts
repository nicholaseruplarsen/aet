// stocks/lib/dataCache.ts

import path from 'path';
import { promises as fs } from 'fs';
import { StockData, FinancialData } from '@/types';

// In-memory caches per ticker
const stockDataCache: { [ticker: string]: StockData[] | null } = {};
const financialStatementsCache: { [ticker: string]: Record<string, FinancialData> | null } = {};

/**
 * Fetch and cache stock data for a given ticker.
 * @param ticker The stock ticker symbol.
 * @returns Promise resolving to an array of StockData or null if not found.
 */
export async function getStockData(ticker: string): Promise<StockData[] | null> {
  if (!(ticker in stockDataCache)) {
    const stockDataPath = path.join(process.cwd(), 'public', 'data', ticker, 'stockData.json');
    try {
      const stockDataRaw = await fs.readFile(stockDataPath, 'utf8');
      stockDataCache[ticker] = JSON.parse(stockDataRaw) as StockData[];
    } catch (error) {
      console.error(`Error reading stock data for ticker "${ticker}":`, error);
      stockDataCache[ticker] = null;
    }
  }
  return stockDataCache[ticker];
}

/**
 * Fetch and cache financial statements for a given ticker.
 * @param ticker The stock ticker symbol.
 * @returns Promise resolving to a Record of FinancialData or null if not found.
 */
export async function getFinancialStatements(ticker: string): Promise<Record<string, FinancialData> | null> {
  if (!(ticker in financialStatementsCache)) {
    const financialStatementsPath = path.join(process.cwd(), 'public', 'data', ticker, 'financialStatements.json');
    try {
      const financialStatementsRaw = await fs.readFile(financialStatementsPath, 'utf8');
      financialStatementsCache[ticker] = JSON.parse(financialStatementsRaw) as Record<string, FinancialData>;
    } catch (error) {
      console.error(`Error reading financial statements for ticker "${ticker}":`, error);
      financialStatementsCache[ticker] = null;
    }
  }
  return financialStatementsCache[ticker];
}
