'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { getNextSevenDays } from '@/lib/dailySaladsMock';

type Status = 'active' | 'paused';

type SubscriptionCard = {
  id: string;
  name: string;
  frequency: string;
  deliverySlot: string;
  nextDeliveryOffset: number;
  status: Status;
};

const INITIAL_SUBSCRIPTIONS: SubscriptionCard[] = [
  {
    id: 'sub-1',
    name: 'Weekday Lite - Sprouts Power Bowl',
    frequency: 'Mon-Fri',
    deliverySlot: '12:30 PM - 2:30 PM',
    nextDeliveryOffset: 1,
    status: 'active',
  },
  {
    id: 'sub-2',
    name: 'Protein Nuts Salad Plan',
    frequency: 'Tue, Thu, Sat',
    deliverySlot: '1:00 PM - 3:00 PM',
    nextDeliveryOffset: 2,
    status: 'paused',
  },
];

export default function SubscriptionsPage() {
  const days = useMemo(() => getNextSevenDays(), []);
  const [subscriptions, setSubscriptions] = useState<SubscriptionCard[]>(INITIAL_SUBSCRIPTIONS);
  const [notice, setNotice] = useState<string | null>(null);

  function setStatus(id: string, status: Status) {
    setSubscriptions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, status } : sub)));
    setNotice(status === 'paused' ? 'Subscription paused (UI demo).' : 'Subscription resumed (UI demo).');
  }

  function skipNext(id: string) {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, nextDeliveryOffset: Math.min(sub.nextDeliveryOffset + 1, 6) }
          : sub
      )
    );
    setNotice('Next delivery skipped (UI demo).');
  }

  return (
    <main className="min-h-screen bg-[#F6EFE7] text-[#1F1E1B]">
      <Header scrolled />

      <section className="px-4 pb-6 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[#D9CFBF] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8B836F] uppercase">My Subscriptions</p>
              <h1 className="mt-1 text-3xl font-black text-[#1B1915]">Manage Daily Salad Plans</h1>
            </div>
            <Link href="/daily-salads" className="rounded-xl bg-[#5B821F] px-5 py-2.5 text-sm font-bold text-white">
              Browse Daily Salads
            </Link>
          </div>
          <p className="mt-3 text-sm text-[#5A554C]">
            Pause, resume, and skip upcoming deliveries. Billing and fulfillment automation will be connected next.
          </p>
          {notice && <p className="mt-3 rounded-lg bg-[#FFF1E6] px-3 py-2 text-sm text-[#A04A00]">{notice}</p>}
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4">
          {subscriptions.map((sub) => {
            const next = days[sub.nextDeliveryOffset] ?? days[0];
            return (
              <article key={sub.id} className="rounded-2xl border border-[#D9CFBF] bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#1B1915]">{sub.name}</h2>
                    <p className="mt-1 text-sm text-[#5A554C]">
                      {sub.frequency} • {sub.deliverySlot}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#4B2E83]">Next delivery: {next.label}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      sub.status === 'active'
                        ? 'bg-[#E0F4E8] text-[#1F6B3F]'
                        : 'bg-[#F4E6D4] text-[#8C4B17]'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => skipNext(sub.id)}
                    className="rounded-lg border border-[#D9CFBF] bg-white px-3 py-2 text-sm font-semibold text-[#1F1E1B]"
                  >
                    Skip Next Delivery
                  </button>
                  {sub.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => setStatus(sub.id, 'paused')}
                      className="rounded-lg border border-[#F1C6CC] bg-white px-3 py-2 text-sm font-semibold text-[#C7442A]"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStatus(sub.id, 'active')}
                      className="rounded-lg bg-[#4B2E83] px-3 py-2 text-sm font-semibold text-white"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
