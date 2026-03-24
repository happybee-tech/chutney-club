'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { addVariantToSingleCart } from '@/lib/cartClient';
import { MENU_SHOWCASE_ITEMS } from '@/lib/menuShowcase';

type CatalogProduct = {
  name: string;
  brandId: string;
  priceFrom: number | null;
  defaultVariant: { id: string; price: number } | null;
};

type SectionProps = {
  fullPage?: boolean;
};

export function MenuShowcaseSection({ fullPage = false }: SectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=50', { cache: 'no-store' });
        const data = await response.json();
        if (!mounted) return;
        if (response.ok && data?.success) {
          setCatalogProducts(data.data?.items ?? []);
        }
      } catch {
        if (mounted) setCatalogProducts([]);
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(
    () =>
      MENU_SHOWCASE_ITEMS.map((item) => {
        if (item.comingSoon) {
          return { ...item, catalogMatch: null };
        }
        const normalizedLookups =
          item.lookupNames?.map((name) => name.toLowerCase().replace(/\s+/g, ' ').trim()) ?? [];
        const catalogMatch = catalogProducts.find((product) => {
          const productName = product.name.toLowerCase().replace(/\s+/g, ' ').trim();
          if (normalizedLookups.some((lookup) => productName === lookup)) return true;
          if (normalizedLookups.some((lookup) => productName.includes(lookup))) return true;
          return false;
        });
        return { ...item, catalogMatch: catalogMatch ?? null };
      }),
    [catalogProducts]
  );
  const visibleCards = useMemo(() => (fullPage ? cards : cards.slice(0, 3)), [cards, fullPage]);

  const handleAddToCart = async (id: string) => {
    const item = cards.find((card) => card.id === id);
    if (!item || item.comingSoon) return;
    if (!item.catalogMatch?.defaultVariant?.id) {
      setMessage(`${item.name} is not mapped to a live product variant yet. Add/update this product in admin first.`);
      return;
    }

    setLoadingId(id);
    setMessage(null);
    try {
      await addVariantToSingleCart({
        variantId: item.catalogMatch.defaultVariant.id,
        brandId: item.catalogMatch.brandId,
      });
      setMessage(`${item.name} added to cart.`);
    } catch (error: unknown) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'UNAUTHORIZED') {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/signin?next=${encodeURIComponent(next)}`;
        return;
      }
      setMessage('Unable to add item to cart right now.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className={fullPage ? 'px-4 pb-16 pt-28 sm:px-6 lg:px-8' : 'px-4 pb-24 pt-8 sm:px-6 lg:px-8'}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E6D4F]">Menu Preview</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-[#1E1A15]">Today&apos;s Salad Menu</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5D4A38]">
              Two salads are live now. More bowls are in prep and launching soon.
            </p>
          </div>
          {!fullPage ? (
            <Link href="/menu" className="rounded-xl bg-[#4B2E83] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(75,46,131,0.35)]">
              View Full Menu
            </Link>
          ) : null}
        </div>

        {message ? (
          <div className="mb-5 rounded-xl border border-[#E4D6C7] bg-white/70 px-4 py-2 text-sm text-[#3E2E22] backdrop-blur">
            {message}
          </div>
        ) : null}

        <div className="mb-6 mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards.map((item, index) => {
            const displayPrice = item.catalogMatch?.priceFrom ?? item.price;
            const isDisabled = item.comingSoon || !item.catalogMatch?.defaultVariant?.id;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="relative overflow-visible rounded-[2rem] border border-white/50 bg-white/20 px-5 pb-5 pt-7 shadow-[0_20px_60px_rgba(33,19,12,0.18)] backdrop-blur-2xl"
              >
                <div className="absolute -top-14 left-1/2 h-36 w-36 -translate-x-1/2 overflow-hidden rounded-full border-2 border-white/80 shadow-[0_14px_36px_rgba(0,0,0,0.24)] sm:h-40 sm:w-40">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                {item.comingSoon ? (
                  <span className="absolute right-4 top-4 rounded-full border border-[#D5C5B3] bg-[#FFF4E7]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8B5A2A]">
                    Coming Soon
                  </span>
                ) : null}

                <div className={`mt-28 sm:mt-32 ${item.comingSoon ? 'blur-[1.8px]' : ''}`}>
                  <h3 className="text-center text-2xl font-black text-[#1D1712]">{item.name}</h3>
                  <p className="mt-1 text-center text-sm text-[#5D4B3C]">{item.subtitle}</p>

                  <div className="mt-4 rounded-[1.4rem] border border-white/55 bg-white/35 p-4 backdrop-blur-xl">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-[#DCC9B5] bg-white/75 px-3 py-1 text-[11px] font-semibold text-[#614936]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-[#4D3D30]">
                      <div className="rounded-lg border border-[#E6D8CA] bg-white/70 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#8B6C4F]">Calories</p>
                        <p className="font-bold">{item.calories} kcal</p>
                      </div>
                      <div className="rounded-lg border border-[#E6D8CA] bg-white/70 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#8B6C4F]">Price</p>
                        <p className="font-bold">Rs {displayPrice}</p>
                      </div>
                      <div className="rounded-lg border border-[#E6D8CA] bg-white/70 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#8B6C4F]">Status</p>
                        <p className="font-bold">{item.comingSoon ? 'Soon' : 'Live'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(item.id)}
                  disabled={isDisabled || loadingId === item.id}
                  className="mt-4 w-full rounded-xl bg-[#E67E22] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(230,126,34,0.35)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-[#CCB29B]"
                >
                  {loadingId === item.id ? 'Adding...' : item.comingSoon ? 'Coming Soon' : 'Add to Cart'}
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
