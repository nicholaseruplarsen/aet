"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Quote } from "@/node_modules/yahoo-finance2/dist/esm/src/modules/quote"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const columns: ColumnDef<any>[] = [
  { accessorKey: 'Market Capitalization', header: 'Market Cap' },
  { accessorKey: 'Revenue', header: 'Revenue' },
  { accessorKey: 'Gross Profit', header: 'Gross Income' },
  { accessorKey: 'Gross Margin', header: 'Gross Margin' },
  { accessorKey: 'EBITDA', header: 'EBITDA' },
  { accessorKey: 'Net Income', header: 'Net Income' },
  { accessorKey: 'Profit Margin', header: 'Profit Margin' },
  { accessorKey: 'EPS (Diluted)', header: 'EPS (Diluted)' },
  { accessorKey: 'Debt/Equity', header: 'Debt/Equity' },
  { accessorKey: 'Operating Cash Flow', header: 'Operating Cash Flow' },
  { accessorKey: 'Research & Development', header: 'Research & Development' },
];
