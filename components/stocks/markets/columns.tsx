// stocks/components/stocks/markets/columns.tsx

"use client"

import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<any>[] = [
  { accessorKey: 'Market Capitalization', header: 'Market Cap' },
  { accessorKey: 'Revenue', header: 'Revenue' },
  { accessorKey: 'Gross Profit', header: 'Gross Income' },
  { accessorKey: 'Gross Margin', header: 'Gross Margin' },
  { accessorKey: 'Net Income', header: 'Net Income' },
  { accessorKey: 'Profit Margin', header: 'Profit Margin' },
  { accessorKey: 'Operating Cash Flow', header: 'Operating Cash Flow' },
  { accessorKey: 'Research & Development', header: 'Research & Development' },

  // New Columns (Removed 'P/FCF Ratio' and 'P/OCF Ratio')
  { accessorKey: 'PE Ratio', header: 'PE Ratio' },
  { accessorKey: 'PS Ratio', header: 'PS Ratio' },
  { accessorKey: 'PB Ratio', header: 'PB Ratio' },
  { accessorKey: 'Quick Ratio', header: 'Quick Ratio' },

  // Moved Columns
  { accessorKey: 'EPS (Diluted)', header: 'EPS (Diluted)' },
  { accessorKey: 'Debt/Equity', header: 'Debt/Equity' },
]
