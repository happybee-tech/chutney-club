import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#F5EBDD_0%,#F2E6D7_100%)]" />}>
      <CheckoutClient />
    </Suspense>
  );
}
