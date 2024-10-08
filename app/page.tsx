// stocks/app/page.tsx

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the default ticker page, e.g., AAPL
  redirect('/stocks/AAPL');
}
