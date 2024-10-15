// stocks/app/tutorial/page.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function TutorialPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Tutorial: Introduction to Stocks</CardTitle>
          <CardDescription>A brief overview of how I have gathered stocks work.</CardDescription>
        </CardHeader>
        <CardContent>
          <section>
            <h2 className="text-xl font-semibold mb-4">Stock Price?</h2>
            <p className="mb-4">
              The stock price, commonly displayed on most stock sites, represents the value of just one share in that company. But we need the market cap to see what the market values the entire company (and all of its outstanding shares) to determine if we think it's overvalued or not.
            </p>
            <h2 className="text-xl font-semibold mb-4">Overvalued?</h2>
            <p className="mb-4">
              Traditionally, a common hypothesis, called fundamental analysis, is that a company's value (market cap), as determined by the market, represents some notion of its finacial reports, i.e. how well it's performing relative to its competitors, and its ability to grow those numbers over time.
            </p>
            <h2 className="text-xl font-semibold mb-4">Ratios & Multiples</h2>
            <p className="mb-4">
              One way to quickly compare that is to get an overview of this is to compare the company's market cap with financial metrics to get a relative measure between companies. This is where ratios and multiples come in. 
            </p>
            <h2 className="text-xl font-semibold mb-4">Is this still the case?</h2>
            <p className="mb-4">
              However, as the website will show you, the stock prices no longer make sense from that framework.
            </p>
            <Link href="/" className="text-blue-500 underline">
              Back to Stocks
            </Link>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
