'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CART_KEY = 'hb_single_cart_id';
const COUPON_KEY = 'hb_cart_coupon';

type CartItem = {
  id: string;
  qty: number;
  priceSnapshot: string | number;
  variant: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
      images?: Array<{ url: string }>;
    };
  };
};

type CartData = {
  id: string;
  items: CartItem[];
};

type ValidateSummary = {
  subtotal: number;
  discount: number;
  total: number;
  coupon?: { code: string | null; valid: boolean; discount: number; message: string | null };
};

export function CartSidebar() {
  const [cartId, setCartId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : localStorage.getItem(CART_KEY)
  );
  const [cart, setCart] = useState<CartData | null>(null);
  const [couponCode, setCouponCode] = useState(() =>
    typeof window === 'undefined' ? '' : localStorage.getItem(COUPON_KEY) ?? ''
  );
  const [appliedCoupon, setAppliedCoupon] = useState(() =>
    typeof window === 'undefined' ? '' : localStorage.getItem(COUPON_KEY) ?? ''
  );
  const [summary, setSummary] = useState<ValidateSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCartUpdate = () => {
      const nextCartId = localStorage.getItem(CART_KEY);
      setCartId(nextCartId);
    };

    window.addEventListener('hb-cart-updated', handleCartUpdate as EventListener);
    window.addEventListener('storage', handleCartUpdate);
    return () => {
      window.removeEventListener('hb-cart-updated', handleCartUpdate as EventListener);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const loadCart = useCallback(
    async (currentCartId: string, coupon?: string) => {
      const response = await fetch(`/api/cart/${currentCartId}`, { credentials: 'include', cache: 'no-store' });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        setCart(null);
        return;
      }
      setCart(data.data as CartData);

      const validate = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cart_id: currentCartId, coupon_code: coupon || undefined }),
      });
      const validationData = await validate.json().catch(() => ({}));
      if (validate.ok && validationData?.success) {
        setSummary(validationData.data?.summary ?? null);
        if (validationData.data?.summary?.coupon?.valid) {
          setMessage(`Coupon ${validationData.data.summary.coupon.code} applied`);
        } else if (coupon && validationData.data?.summary?.coupon?.message) {
          setMessage(validationData.data.summary.coupon.message);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!cartId) return;
    Promise.resolve()
      .then(() => loadCart(cartId, appliedCoupon))
      .catch(() => setCart(null));
  }, [cartId, appliedCoupon, loadCart]);

  const rawSubtotal = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.qty, 0);
  }, [cart]);

  const totals = useMemo(() => {
    if (!summary) {
      return { subtotal: rawSubtotal, discount: 0, total: rawSubtotal };
    }
    return summary;
  }, [rawSubtotal, summary]);

  const updateQty = async (itemId: string, nextQty: number) => {
    if (!cartId) return;
    if (nextQty <= 0) {
      await removeItem(itemId);
      return;
    }
    setLoading(true);
    await fetch(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ qty: nextQty }),
    });
    await loadCart(cartId, appliedCoupon);
    setLoading(false);
  };

  const removeItem = async (itemId: string) => {
    if (!cartId) return;
    setLoading(true);
    await fetch(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await loadCart(cartId, appliedCoupon);
    setLoading(false);
  };

  const applyCoupon = async () => {
    const normalized = couponCode.trim().toUpperCase();
    localStorage.setItem(COUPON_KEY, normalized);
    setAppliedCoupon(normalized);
    if (!cartId) return;
    setLoading(true);
    await loadCart(cartId, normalized);
    setLoading(false);
  };

  if (!cartId) return null;

  return (
    <aside className="fixed right-5 top-24 z-40 hidden w-[340px] rounded-3xl border border-white/55 bg-white/75 p-4 shadow-[0_22px_50px_rgba(21,18,14,0.16)] backdrop-blur-2xl xl:block">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-black text-[#2A1E15]">Your Cart</h3>
        <span className="text-xs font-semibold text-[#7A624F]">{cart?.items?.length ?? 0} items</span>
      </div>

      {!cart?.items?.length ? (
        <p className="rounded-xl border border-[#E5D7C7] bg-white/70 px-3 py-4 text-sm text-[#6A5441]">Cart is empty.</p>
      ) : (
        <div className="space-y-3">
          <div className="max-h-[280px] space-y-2 overflow-auto pr-1">
            {cart.items.map((item) => {
              const image = item.variant.product.images?.[0]?.url || '/community-default.png';
              const price = Number(item.priceSnapshot);
              return (
                <article key={item.id} className="rounded-2xl border border-[#E8DBCE] bg-white/80 p-2.5">
                  <div className="flex gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[#E5D8C9]">
                      <Image src={image} alt={item.variant.product.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#2B2018]">{item.variant.product.name}</p>
                      <p className="truncate text-xs text-[#6F5A48]">{item.variant.name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-sm font-bold text-[#E67E22]">Rs {price}</p>
                        <div className="inline-flex items-center rounded-full border border-[#E5D8C9] bg-white">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="px-2 py-0.5 text-sm text-[#5A4534]"
                            disabled={loading}
                          >
                            −
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="px-2 py-0.5 text-sm text-[#5A4534]"
                            disabled={loading}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#E8DBCE] bg-white/80 p-3">
            <label htmlFor="coupon" className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#7C6551]">
              Coupon
            </label>
            <div className="flex gap-2">
              <input
                id="coupon"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="NEW10"
                className="w-full rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none focus:border-[#C59A73]"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-xl bg-[#4B2E83] px-3 py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
            {message ? <p className="mt-2 text-xs text-[#6A5543]">{message}</p> : null}
          </div>

          <div className="rounded-2xl border border-[#E8DBCE] bg-white/80 p-3 text-sm">
            <div className="flex justify-between py-1 text-[#5A4533]">
              <span>Subtotal</span>
              <span>Rs {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-[#5A4533]">
              <span>Discount</span>
              <span>- Rs {totals.discount.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-[#E6D8C9] pt-2 font-bold text-[#2A1D14]">
              <span>Total</span>
              <span>Rs {totals.total.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href={`/checkout?cart_id=${cartId}`}
            className="block rounded-xl bg-[#E67E22] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_12px_26px_rgba(230,126,34,0.33)]"
          >
            Go To Checkout
          </Link>
        </div>
      )}
    </aside>
  );
}
