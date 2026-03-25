'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { addVariantToSingleCart } from '@/lib/cartClient';
import { getLocalCartItems, updateLocalCartItemQty } from '@/lib/localCart';

type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  brandId: string;
  isActive: boolean;
  isOutOfStock: boolean;
  priceFrom: number | null;
  image: string | null;
  isPerishable: boolean;
  categories: Array<{ id: string; name: string; slug: string }>;
  defaultVariant: { id: string; price: number; name?: string; calories?: number | null } | null;
};

type LocalCartItem = {
  variantId: string;
  productId: string;
  qty: number;
};

type SectionProps = {
  fullPage?: boolean;
};

export function MenuShowcaseSection({ fullPage = false }: SectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=50&include_inactive=true', { cache: 'no-store' });
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

  const productBackedCards = useMemo(() => catalogProducts.filter((item) => item.defaultVariant?.id), [catalogProducts]);
  const visibleCards = useMemo(
    () => (fullPage ? productBackedCards : productBackedCards.slice(0, 3)),
    [fullPage, productBackedCards]
  );

  const refreshCart = async () => {
    setCartLoading(true);
    try {
      setCartItems(
        getLocalCartItems().map((item) => ({
          variantId: item.variantId,
          productId: item.productId,
          qty: item.qty,
        }))
      );
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    refreshCart().catch(() => setCartItems([]));
    const onCartUpdated = (event?: Event) => {
      const detail = (event as CustomEvent<{ source?: string }> | undefined)?.detail;
      if (detail?.source === 'menu-showcase') return;
      refreshCart().catch(() => setCartItems([]));
    };
    window.addEventListener('hb-cart-updated', onCartUpdated as EventListener);
    return () => {
      window.removeEventListener('hb-cart-updated', onCartUpdated as EventListener);
    };
  }, []);

  const getCartItemForProduct = (productId: string) => {
    return cartItems.find((cartItem) => cartItem.productId === productId) ?? null;
  };

  const handleAddToCart = async (product: CatalogProduct) => {
    if (!product.defaultVariant?.id || !product.isActive || product.isOutOfStock) return;

    setLoadingId(product.id);
    try {
      await addVariantToSingleCart({
        variantId: product.defaultVariant.id,
        productId: product.id,
        productName: product.name,
        variantName: product.defaultVariant.name || 'Default',
        price: Number(product.defaultVariant.price ?? product.priceFrom ?? 0),
        imageUrl: product.image,
        brandId: product.brandId,
      });
    } catch (error: unknown) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'UNAUTHORIZED') {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/signin?next=${encodeURIComponent(next)}`;
        return;
      }
    } finally {
      setLoadingId(null);
    }
  };

  const changeItemQty = async (product: CatalogProduct, nextQty: number) => {
    const cartItem = getCartItemForProduct(product.id);
    if (!cartItem) {
      if (nextQty > 0) {
        await handleAddToCart(product);
      }
      return;
    }

    setLoadingId(product.id);
    try {
      updateLocalCartItemQty(cartItem.variantId, nextQty);
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
              Order now and take the first step towards a healthier you!
            </p>
          </div>
          {!fullPage ? (
            <Link href="/menu" className="rounded-xl bg-[#4B2E83] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(75,46,131,0.35)]">
              View Full Menu
            </Link>
          ) : null}
        </div>

        {cartLoading ? (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#E4D6C7] bg-white/70 px-4 py-2 text-sm text-[#3E2E22] backdrop-blur">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#5B821F] border-t-transparent" />
            Loading cart...
          </div>
        ) : null}

        <div className="mb-2 mt-24 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards.map((item, index) => {
            const displayPrice = item.priceFrom ?? item.defaultVariant?.price ?? 0;
            const cartItem = getCartItemForProduct(item.id);
            const isComingSoon = !item.isActive;
            const isOutOfStock = item.isOutOfStock;
            const tags = (item.categories?.map((category) => category.name) ?? []).slice(0, 4);
            const tagStyles = [
              'bg-[#FFE9D2] border-[#F3C28D] text-[#965012]',
              'bg-[#E9F7E8] border-[#A9D9A4] text-[#2E6E2D]',
              'bg-[#E8F0FF] border-[#B9CCF8] text-[#284B8F]',
              'bg-[#F2EAFE] border-[#D1BCF9] text-[#5A3695]',
            ];
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className={`relative overflow-visible rounded-[2rem] border border-white/50 bg-white/20 px-5 pb-5 pt-7 shadow-[0_20px_60px_rgba(33,19,12,0.18)] backdrop-blur-2xl ${index > 0 ? 'mt-12 sm:mt-0' : ''}`}
              >
                <div className="absolute -top-14 left-1/2 h-36 w-36 -translate-x-1/2 overflow-hidden rounded-full border-2 border-white/80 shadow-[0_14px_36px_rgba(0,0,0,0.24)] sm:h-40 sm:w-40">
                  <Image src={item.image || '/community-default.png'} alt={item.name} fill className="object-cover" />
                </div>
                {isComingSoon ? (
                  <span className="absolute right-4 top-4 rounded-full border border-[#D5C5B3] bg-[#FFF4E7]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8B5A2A]">
                    Coming Soon
                  </span>
                ) : null}
                {isOutOfStock && !isComingSoon ? (
                  <span className="absolute right-4 top-4 rounded-full border border-[#C7D8AE] bg-[#EEF5E2]/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#4B6A1A]">
                    Out of Stock
                  </span>
                ) : null}

                <div className="mt-20 sm:mt-24">
                  <h3 className="text-center text-2xl font-black text-[#1D1712]">{item.name}</h3>
                  <p className="mt-1 text-center text-sm text-[#5D4B3C]">{item.description || 'Freshly prepared salad bowl.'}</p>

                  <div className="mt-4 rounded-[1.4rem] border border-white/55 bg-white/35 p-4 backdrop-blur-xl">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {tags.map((tag, tagIndex) => (
                        <span
                          key={tag}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${tagStyles[tagIndex % tagStyles.length]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#4D3D30]">
                      <div className="rounded-lg border border-[#E6D8CA] bg-white/70 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#8B6C4F]">Price</p>
                        <p className="font-bold">Rs {displayPrice}</p>
                      </div>
                      <div className="rounded-lg border border-[#E6D8CA] bg-white/70 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#8B6C4F]">Calories</p>
                        <p className="font-bold">{item.defaultVariant?.calories ?? '-'} kcal</p>
                      </div>
                    </div>
                  </div>
                </div>

                {cartItem && !isComingSoon && !isOutOfStock ? (
                  <div className="mt-4 flex items-center justify-center gap-4 rounded-xl border border-[#E4D3C0] bg-white/75 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => changeItemQty(item, cartItem.qty - 1)}
                      disabled={loadingId === item.id}
                      className="h-8 w-8 rounded-full border border-[#DCC9B5] bg-white text-lg font-bold text-[#5A4534] disabled:opacity-60"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold text-[#2F241B]">{cartItem.qty}</span>
                    <button
                      type="button"
                      onClick={() => changeItemQty(item, cartItem.qty + 1)}
                      disabled={loadingId === item.id}
                      className="h-8 w-8 rounded-full border border-[#DCC9B5] bg-white text-lg font-bold text-[#5A4534] disabled:opacity-60"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    disabled={loadingId === item.id || isComingSoon || isOutOfStock}
                    className="mt-4 w-full rounded-xl bg-[#5B821F] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(91,130,31,0.35)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-[#CCB29B]"
                  >
                    {loadingId === item.id ? 'Adding...' : isComingSoon ? 'Coming Soon' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
              </motion.article>
            );
          })}
        </div>
        {!visibleCards.length ? (
          <div className="rounded-2xl border border-[#E6D8C9] bg-white/70 px-5 py-8 text-center text-sm text-[#6A5440]">
            No menu items are live yet. Add products and active variants from admin to display them here.
          </div>
        ) : null}
      </div>
    </section>
  );
}
