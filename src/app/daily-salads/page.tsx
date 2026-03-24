'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { getMenuForOffset, getNextSevenDays, SUBSCRIPTION_PLANS } from '@/lib/dailySaladsMock';

export default function DailySaladsPage() {
  const [dayOffset, setDayOffset] = useState(0);
  const days = useMemo(() => getNextSevenDays(), []);
  const menu = getMenuForOffset(dayOffset).slice(0, 6);
  const featured = getMenuForOffset(dayOffset)[0];
  const weeklyCycle = useMemo(
    () =>
      days.map((day) => ({
        day,
        salad: getMenuForOffset(day.offset)[0],
      })),
    [days]
  );

  return (
    <main className="min-h-screen bg-[#111513] text-white">
      <Header scrolled />

      <section className="relative overflow-hidden px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <Image
          src="/hero-background.jpg"
          alt="Fresh salad prep"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,10,9,0.78)_0%,rgba(10,14,12,0.64)_35%,rgba(9,12,11,0.70)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(115,196,108,0.23)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(93,142,228,0.18)_0%,transparent_56%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/25 bg-white/10 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/75 uppercase">Daily Salads</p>
              <h1 className="mt-3 text-5xl font-black leading-[0.92] tracking-tight">Eat Fresh Everyday</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/82">
                Explore day-wise bowls, order a one-time trial pack, or subscribe and automate your weekday salad routine.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-xl border border-white/35 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
                  One-time Trial
                </Link>
                <Link href="/subscriptions" className="rounded-xl bg-[#4B2E83] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(75,46,131,0.45)]">
                  Subscribe Now
                </Link>
              </div>
            </div>

            <article className="rounded-[2rem] border border-white/25 bg-white/12 p-4 shadow-[0_28px_72px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={featured?.image || '/sprouts-mix.png'}
                  alt={featured?.name || 'Featured salad'}
                  width={460}
                  height={300}
                  className="h-52 w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase">Featured Bowl</p>
                <h2 className="mt-1 text-2xl font-black">{featured?.name ?? 'Protein Punch'}</h2>
                <p className="mt-1 text-sm text-white/75">{featured?.subtitle}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-[#8DE281]">Rs {featured?.trialPrice ?? 159}</p>
                  <button type="button" className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    Buy Now
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-8 sm:px-6 lg:px-8">
        <Image src="/banner-2.jpg" alt="Salad texture" fill className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,11,0.88)_0%,rgba(9,13,11,0.68)_100%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="relative mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-black">Our Trendy Salads</h2>
            <p className="text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">Daily Menu</p>
          </div>
          <div className="relative mb-6 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {days.map((day) => (
              <button
                key={day.label}
                type="button"
                onClick={() => setDayOffset(day.offset)}
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  day.offset === dayOffset
                    ? 'border-white/50 bg-white/30 text-white backdrop-blur'
                    : 'border-white/22 bg-white/10 text-white/85 hover:border-white/45'
                }`}
              >
                <p className="text-sm font-semibold">{day.label}</p>
              </button>
            ))}
          </div>

          <div className="relative mt-12 grid gap-6 xl:grid-cols-3">
            {menu.map((item) => (
              <article
                key={item.id}
                className="relative overflow-visible rounded-[2.2rem] border border-white/22 bg-white/10 px-5 pb-5 pt-6 shadow-[0_24px_62px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-6"
              >
                <div className="absolute -top-12 left-1/2 h-36 w-36 -translate-x-1/2 overflow-hidden rounded-full border-2 border-white/60 shadow-[0_16px_38px_rgba(0,0,0,0.38)] sm:h-40 sm:w-40">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="mt-28 text-center sm:mt-32">
                  <h3 className="text-2xl font-extrabold">{item.name}</h3>
                  <p className="mt-1 text-sm text-white/80">{item.subtitle}</p>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-white/22 bg-black/24 p-4 backdrop-blur-lg sm:p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/30 bg-white/16 px-3 py-1 text-xs font-semibold text-white">
                        {tag}
                      </span>
                    ))}
                    <span className="rounded-full border border-[#8DE281]/45 bg-[#8DE281]/20 px-3 py-1 text-xs font-semibold text-[#D5FFCF]">
                      Protein {item.proteinG}g
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/20 bg-white/8 p-3 text-xs text-white/82">
                    <p>Prep: {item.prepTimeMinutes} mins</p>
                    <p>Cutoff: {item.cutoffTime}</p>
                    <p>Delivery: {item.slot}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-black text-[#8DE281]">Rs {item.trialPrice}</p>
                      <p className="text-xs text-white/60 line-through">Rs {item.price}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="rounded-lg border border-white/28 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                        Trial
                      </button>
                      <button type="button" className="rounded-lg bg-[#4B2E83] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(75,46,131,0.45)]">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-16 sm:px-6 lg:px-8">
        <Image src="/banner-1.jpg" alt="Weekly salad rotation" fill className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,12,0.86)_0%,rgba(10,14,12,0.70)_100%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-white/72 uppercase">Subscription Preview</p>
              <h2 className="mt-1 text-3xl font-black">7-Day Rotation Menu</h2>
              <p className="mt-2 text-sm text-white/80">
                This weekly menu repeats every week. Review all 7 salads before choosing your subscription.
              </p>
            </div>
            <button type="button" className="rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white">
              Subscribe to Weekly Cycle
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {weeklyCycle.map(({ day, salad }) => (
              <article key={day.label} className="rounded-2xl border border-white/22 bg-white/12 p-3 shadow-[0_16px_42px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-white/75 uppercase">
                  {day.offset === 0 ? 'Today' : day.label}
                </p>
                <div className="relative mt-2 h-24 overflow-hidden rounded-xl border border-white/25">
                  <Image src={salad.image} alt={salad.name} fill className="object-cover" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-white">{salad.name}</h3>
                <p className="mt-1 text-xs text-white/75">{salad.kcal} kcal • {salad.proteinG}g protein</p>
                <p className="mt-1 text-xs font-semibold text-[#8DE281]">Rs {salad.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-20 sm:px-6 lg:px-8">
        <Image src="/banner-3.jpg" alt="Top salads background" fill className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,10,0.85)_0%,rgba(8,11,10,0.74)_100%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="relative mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-white/72 uppercase">Our Top Selling</p>
              <h2 className="mt-1 text-3xl font-black">Subscription Plans</h2>
            </div>
            <Link href="/subscriptions" className="text-sm font-semibold text-white underline underline-offset-4">
              Manage subscriptions
            </Link>
          </div>
          <div className="relative grid gap-5 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <article key={plan.id} className="rounded-[1.6rem] border border-white/22 bg-white/13 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                <p className="text-xs font-semibold tracking-[0.08em] text-white/75 uppercase">{plan.frequency}</p>
                <h3 className="mt-1 text-2xl font-black">{plan.name}</h3>
                <p className="mt-2 text-lg font-bold text-[#8DE281]">
                  {plan.monthlyPrice ? `Rs ${plan.monthlyPrice}/month` : 'Custom pricing'}
                </p>
                <p className="text-sm font-semibold text-white/85">{plan.savingsLabel}</p>
                <ul className="mt-3 space-y-1 text-sm text-white/80">
                  {plan.highlights.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
                <button type="button" className="mt-5 w-full rounded-lg bg-[#5B821F] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(91,130,31,0.34)]">
                  Choose Plan
                </button>
              </article>
            ))}
          </div>

          <div className="relative mt-12">
            <h3 className="mb-4 text-3xl font-black">Customer Review</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: 'Riya Mehra',
                  text: 'I skipped junk food for two weeks. Fresh bowls and reliable slots helped me stay consistent.',
                },
                {
                  name: 'Aman Sharma',
                  text: 'Customization options are solid. I can swap ingredients and keep my macros in check daily.',
                },
                {
                  name: 'Neha Kaur',
                  text: 'Berry and sprouts bowls are now my weekday lunch default. Taste and texture both are great.',
                },
              ].map((review) => (
                <article key={review.name} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="text-sm font-bold">{review.name}</p>
                  <p className="mt-2 text-sm text-white/80">{review.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
