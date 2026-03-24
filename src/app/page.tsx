'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/sections/Footer';
import { MenuShowcaseSection } from '@/components/sections/MenuShowcaseSection';

const CORE_OFFERINGS = [
  {
    title: 'High Protein Salads',
    subtitle: 'Protein-forward salads built for satiety with sprouts, seeds, and balanced chutneys.',
    image: '/high-protein-salads.png',
    className: 'lg:col-span-2 lg:row-span-2',
    heightClass: 'min-h-[280px] lg:min-h-[520px]',
    accent: '#9AD18B',
  },
  {
    title: 'Fresh Drinks',
    subtitle: 'Hydrating lemon and detox drinks prepared in daily small batches.',
    image: '/lemon-drink.png',
    className: 'lg:col-span-1 lg:row-span-2',
    heightClass: 'min-h-[280px] lg:min-h-[520px]',
    accent: '#F4BA71',
  },
  {
    title: 'Detox Drinks',
    subtitle: 'Light, clean blends to support daytime energy and recovery.',
    image: '/detox-drink.png',
    className: 'lg:col-span-1',
    heightClass: 'min-h-[240px]',
    accent: '#8CC0F2',
  },
  {
    title: 'Smoothie Bowls',
    subtitle: 'Nutrient-dense smoothie bowls with texture, fiber, and flavor.',
    image: '/smoothie-bowl.png',
    className: 'lg:col-span-1',
    heightClass: 'min-h-[240px]',
    accent: '#D6B0FF',
  },
];

const DIFFERENCE_CARDS = [
  {
    title: '100% Clean Ingredients',
    text: 'No hidden sugars, no preservatives, and no filler oils.',
    stat: '0% Hidden Additives',
    icon: 'leaf',
    tint: 'from-[#CFF2C8] via-[#BEEAB4] to-[#E9F8E4]',
  },
  {
    title: 'Chef Crafted + Nutritionist Approved',
    text: 'Every bowl is flavor-first, but macro-balanced for consistency.',
    stat: 'Balanced Macros',
    icon: 'spark',
    tint: 'from-[#FEE2BD] via-[#F9D5A2] to-[#FFF1DD]',
  },
  {
    title: 'Locally Sourced Daily',
    text: 'Ingredients move from local farms to kitchen prep every morning.',
    stat: 'Harvest To Bowl',
    icon: 'pin',
    tint: 'from-[#DFD4FB] via-[#CDBAFA] to-[#F2ECFF]',
  },
];

const CHUTNEY_PROFILES = [
  {
    name: 'Smoked Tomato Chutney',
    note: 'Tangy, roasted depth that pairs with sprouts and grain bowls.',
    mood: 'Chatpata',
    pair: 'Best with: Protein bowls',
    heat: 2,
    tint: 'from-[#F9C39A] to-[#F2A466]',
    cardBg: 'bg-[linear-gradient(160deg,#FFF3E8_0%,#FBE2CC_100%)] border-[#EAC5A2]',
  },
  {
    name: 'Mint Coriander Dressing',
    note: 'Fresh herb brightness with mild heat for daily comfort.',
    mood: 'Fresh & Cooling',
    pair: 'Best with: Green detox bowls',
    heat: 1,
    tint: 'from-[#BFE9B1] to-[#8ED07A]',
    cardBg: 'bg-[linear-gradient(160deg,#F0FAEC_0%,#DDF3D4_100%)] border-[#BFDFAF]',
  },
  {
    name: 'Sesame Peanut Masala',
    note: 'Nutty body with balanced spice for familiar Indian flavor.',
    mood: 'Rich & Savory',
    pair: 'Best with: Crunch salads',
    heat: 3,
    tint: 'from-[#E8D0A8] to-[#D3A86D]',
    cardBg: 'bg-[linear-gradient(160deg,#FAF3E7_0%,#ECDCBD_100%)] border-[#D8C29C]',
  },
];

const JOURNEY_STEPS = [
  { time: '06:00 AM', title: 'Vegetables Harvested Daily', detail: 'Sourced fresh from local partner farms.' },
  { time: '09:00 AM', title: 'Kitchen Prep + Cold Pressing', detail: 'Chef team prepares bowls by batch windows.' },
  { time: '12:30 PM', title: 'Delivered To Desk/Home', detail: 'Fresh dispatch to offices and societies in Bangalore.' },
];

const REVIEWS = [
  'Finally a lunch routine I can stick to.',
  'No prep stress, just clean food at the right time.',
  'The protein bowls keep me full through meetings.',
  'Our office switched from junk orders to salad subscriptions.',
  'Freshness is actually consistent every weekday.',
  'Macros and taste both feel balanced.',
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = ['/banner-1.jpg', '/banner-2.jpg', '/banner-3.jpg'];
  const marqueeItems = useMemo(() => [...REVIEWS, ...REVIEWS], []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <main className="bg-[#F3ECE2] text-[#1F1E1B]">
      <Header scrolled={isScrolled} />

      <section className="relative min-h-[92vh] overflow-hidden pb-20 pt-32">
        <div className="absolute inset-0">
          {heroSlides.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt="Healthy salad background"
              fill
              priority={index === 0}
              className={`object-cover transition-opacity duration-700 ${activeSlide === index ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(21,20,18,0.68)_0%,rgba(21,20,18,0.46)_38%,rgba(21,20,18,0.22)_100%)]" />
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#5B821F]/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#98B69A]/30 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl rounded-3xl border border-white/30 bg-white/18 p-7 shadow-[0_22px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-10"
          >
            <p className="mb-5 inline-flex rounded-full border border-white/35 bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
              DAILY SALADS. ZERO DRAMA.
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Eat Clean
              <br />
              Without Thinking
              <br />
              Too Hard.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
              Chutney Club brings fresh salads and functional nutrition from focused brands. Order once, or subscribe and stay consistent.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/daily-salads"
                className="rounded-xl bg-[#5B821F] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(91,130,31,0.35)] transition hover:translate-y-[-2px]"
              >
                View All Salads
              </Link>
              <a href="#value-proposition" className="rounded-xl border border-white/45 bg-white/15 px-7 py-3 text-sm font-semibold text-white">
                See The Difference
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <MenuShowcaseSection />

      {/* <section id="value-proposition" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-[#D9C7AE] bg-[linear-gradient(150deg,#FFF8EF_0%,#F8EBDD_100%)] p-8 shadow-[0_20px_50px_rgba(68,42,17,0.15)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A5B31]">Where Consistency Breaks</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#2B1A10]">Wellness plans fail in the middle of busy days.</h2>
            <div className="mt-6 space-y-3">
              {[
                'Long workdays trigger skipped lunches and random ordering.',
                'Meal prep means planning, shopping, chopping, and cleanup.',
                'Healthy options often miss either taste, timing, or macros.',
              ].map((line) => (
                <div key={line} className="flex items-start gap-3 rounded-xl border border-[#E9D8C4] bg-white/70 px-4 py-3 text-sm text-[#5A4432]">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5B821F]/20 text-[#A0520E]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M12 8v5" />
                      <path d="M12 16h.01" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </span>
                  <p>{line}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-3xl border border-[#513A76] bg-[linear-gradient(145deg,#3B255C_0%,#4B2E83_40%,#2A1A42_100%)] p-8 text-white shadow-[0_30px_70px_rgba(48,24,79,0.45)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D7CAF0]">What Keeps You On Track</p>
            <h3 className="mt-3 text-4xl font-black leading-tight">Chutney Club turns healthy eating into a simple daily default.</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {['Ready-to-eat daily bowls', 'Balanced protein + fibre', 'Cutoff-based fresh prep', 'Bangalore desk/home delivery'].map((line) => (
                <div key={line} className="flex items-center gap-2 rounded-xl border border-white/22 bg-white/10 px-4 py-3 text-sm">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#5B821F]/25 text-[#FFD2A6]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                      <path d="M5 12l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section> */}

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B836F]">Our Core Offerings</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-[#1B1915]">Curated nutrition, not just a salad list.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {CORE_OFFERINGS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-3xl border border-[#E6D8C5] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)] ${item.className} ${item.heightClass}`}
              >
                <div className="relative h-full min-h-[inherit]">
                  <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,16,14,0.18)_0%,rgba(14,16,14,0.55)_78%)]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${item.accent}44`, color: item.accent }}>
                    Curated
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-white/88">{item.subtitle}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#E2D1BC] bg-[linear-gradient(145deg,#FFF7EE_0%,#F5E5D6_55%,#F0DDCA_100%)] p-8 shadow-[0_22px_58px_rgba(81,46,17,0.14)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A5B31]">Taste Consistency Layer</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-[#2D1C12]">
                Indianized dressings that make salads feel familiar.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5C4635]">
                Our core differentiation is not only what goes into the bowl, but what ties it together. Chutneys and
                dressings inspired by Indian flavors improve taste adherence, so healthy eating becomes repeatable.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Signature bases', value: '03' },
                  { label: 'Flavor variants', value: '12+' },
                  { label: 'Repeat intent', value: 'High' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-[#E8D8C5] bg-white/72 px-3 py-3">
                    <p className="text-lg font-black text-[#2E1C13]">{stat.value}</p>
                    <p className="text-xs text-[#6A5240]">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  'Built for Indian palate preferences',
                  'Balanced flavor without heavy sugar loads',
                  'Designed for daily habit retention',
                  'Pairs by bowl type for better experience',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-[#E8D8C5] bg-white/70 px-4 py-3 text-sm text-[#5A4433]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4B2E83]/12 text-[#4B2E83]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                        <path d="M5 12l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4">
              {CHUTNEY_PROFILES.map((profile, index) => (
                <motion.article
                  key={profile.name}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -4, scale: 1.008 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl border p-5 shadow-[0_12px_28px_rgba(0,0,0,0.08)] ${profile.cardBg}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-[#2B1A10]">{profile.name}</h3>
                    <span
                      className={`inline-flex rounded-full bg-gradient-to-r ${profile.tint} px-3 py-1 text-xs font-bold text-[#3A2618]`}
                    >
                      {profile.mood}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#5A4535]">{profile.note}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6E4D34]">{profile.pair}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, level) => (
                        <span
                          key={level}
                          className={`h-2.5 w-7 rounded-full ${level < profile.heat ? 'bg-[#5B821F]' : 'bg-[#E9DCCB]'}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#E3D5C4] bg-[linear-gradient(160deg,#FFF8EF_0%,#F7EBDD_55%,#F3E2CF_100%)] p-8 shadow-[0_28px_70px_rgba(67,37,12,0.13)] md:p-10">
          <div className="pointer-events-none absolute hidden h-48 w-48 rounded-full bg-[#5B821F]/20 blur-3xl md:block" />
          <div className="pointer-events-none absolute right-16 top-20 hidden h-40 w-40 rounded-full bg-[#6E53A4]/25 blur-3xl md:block" />
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B836F]">The Chutney Club Difference</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-[#1B1915]">Built for trust, not just appetite.</h2>
          </div>

          <div className="relative grid gap-5 md:grid-cols-3">
            {DIFFERENCE_CARDS.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.012 }}
                viewport={{ once: true }}
                className={`group rounded-3xl border border-[#E5D8C8] bg-gradient-to-br ${card.tint} p-6 shadow-[0_20px_44px_rgba(0,0,0,0.09)]`}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/75 bg-white/60 text-[#2A2A26] shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
                    {card.icon === 'leaf' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M5 21c7 0 14-5 14-14-9 0-14 7-14 14z" />
                        <path d="M8 15c2-2 5-4 9-5" />
                      </svg>
                    ) : null}
                    {card.icon === 'spark' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M12 2l2.2 4.8L19 9l-4.8 2.2L12 16l-2.2-4.8L5 9l4.8-2.2L12 2z" />
                      </svg>
                    ) : null}
                    {card.icon === 'pin' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-white/75 bg-white/65 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5D4A36]">
                    {card.stat}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-black text-[#1B1915]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4E4A41]">{card.text}</p>
                <div className="mt-5 h-1.5 w-24 rounded-full bg-[linear-gradient(90deg,#5B821F_0%,#4B2E83_100%)] transition-all duration-300 group-hover:w-36" />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#6D548D] bg-[linear-gradient(145deg,#2A1F3F_0%,#4B2E83_40%,#7A4A2A_100%)] p-8 text-white shadow-[0_32px_76px_rgba(45,24,78,0.42)] md:p-10">
          <div className="pointer-events-none absolute -left-10 top-6 h-48 w-48 rounded-full bg-[#5B821F]/35 blur-3xl" />
          <div className="pointer-events-none absolute right-6 top-0 h-56 w-56 rounded-full bg-[#9B84D3]/30 blur-3xl" />

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E6DAFB]">Farm To Desk Journey</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight">Freshness, timed down to the hour.</h2>
          <p className="mt-3 max-w-3xl text-sm text-white/82">
            Every bowl follows a tight operational clock so what reaches your desk still tastes freshly made.
          </p>

          <div className="relative mt-10 grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-8 right-8 top-8 hidden h-[2px] origin-left bg-[linear-gradient(90deg,#5B821F_0%,#D4C3FF_50%,#9AE18A_100%)] md:block"
            />
            {JOURNEY_STEPS.map((step, index) => (
              <motion.article
                key={step.time}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                whileHover={{ y: -6, scale: 1.01 }}
                viewport={{ once: true }}
                className="relative rounded-2xl border border-white/22 bg-white/10 p-5 shadow-[0_14px_34px_rgba(8,7,14,0.28)] backdrop-blur-md"
              >
                <motion.span
                  animate={{ boxShadow: ['0 0 0 0 rgba(91,130,31,0.0)', '0 0 0 10px rgba(91,130,31,0.0)', '0 0 0 0 rgba(91,130,31,0.0)'] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.35 }}
                  className="absolute -top-3 left-5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/60 bg-[#5B821F]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </motion.span>

                <div className="mb-3 inline-flex rounded-full border border-white/30 bg-white/18 px-3 py-1 text-xs font-semibold text-[#D4F7C8]">
                  {step.time}
                </div>
                <h3 className="text-xl font-black">{step.title}</h3>
                <p className="mt-2 text-sm text-white/82">{step.detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#E3D7C8] bg-[linear-gradient(165deg,#FFF9F2_0%,#F7EEE3_65%,#F3E9DD_100%)] p-8 text-[#2C241E] shadow-[0_24px_58px_rgba(81,52,21,0.12)] md:p-10">
          <div className="pointer-events-none absolute -left-10 top-10 h-36 w-36 rounded-full bg-[#5B821F]/12 blur-3xl" />
          <div className="pointer-events-none absolute right-8 top-6 h-40 w-40 rounded-full bg-[#7E5AB3]/10 blur-3xl" />

          <div className="relative mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B5E37]">Community Momentum</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">Real people. Real consistency.</h2>
              <p className="mt-2 text-sm text-[#5D4C3D]">What users say after switching to daily Chutney Club bowls.</p>
            </div>
            <Link href="/daily-salads" className="rounded-lg border border-[#D7C6AF] bg-white/80 px-4 py-2 text-sm font-semibold text-[#3A2B1E] backdrop-blur">
              View Daily Menu
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#E5D8C8] bg-white/70 py-4 backdrop-blur-md">
            <motion.div
              className="flex gap-4 px-4"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, repeatType: 'loop', duration: 22, ease: 'linear' }}
            >
              {marqueeItems.map((quote, index) => (
                <article
                  key={`${quote}-${index}`}
                  className="min-w-[300px] rounded-2xl border border-[#E5D6C3] bg-[linear-gradient(160deg,#FFFFFF_0%,#FBF5EE_100%)] px-5 py-4 shadow-[0_10px_24px_rgba(81,52,21,0.1)] backdrop-blur"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#FFD089]">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-[#D9C4AA] bg-[#F6EBDD]" />
                  </div>
                  <p className="text-sm leading-relaxed text-[#4C3C30]">&ldquo;{quote}&rdquo;</p>
                </article>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
