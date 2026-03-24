'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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

type AvailableCoupon = {
  id: string;
  code: string;
  name: string;
  discountPct: number;
  minSubtotal: number;
  maxDiscount: number | null;
};

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function CartSidebar({ open, onClose }: CartSidebarProps) {
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
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCartUpdate = () => {
      const nextCartId = localStorage.getItem(CART_KEY);
      setCartId(nextCartId);
      if (!nextCartId) {
        setCart(null);
        setSummary(null);
      }
    };

    window.addEventListener('hb-cart-updated', handleCartUpdate as EventListener);
    window.addEventListener('storage', handleCartUpdate);
    return () => {
      window.removeEventListener('hb-cart-updated', handleCartUpdate as EventListener);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    fetch('/api/coupons', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (data?.success) {
          setAvailableCoupons((data.data ?? []) as AvailableCoupon[]);
        }
      })
      .catch(() => setAvailableCoupons([]));
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

  useEffect(() => {
    if (!open) return;
    Promise.resolve()
      .then(async () => {
        const latestCartId = localStorage.getItem(CART_KEY);
        setCartId(latestCartId);
        if (!latestCartId) {
          setCart(null);
          setSummary(null);
          return;
        }
        await loadCart(latestCartId, appliedCoupon);
      })
      .catch(() => setCart(null));
  }, [open, appliedCoupon, loadCart]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
    window.dispatchEvent(new CustomEvent('hb-cart-updated', { detail: { cartId } }));
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
    window.dispatchEvent(new CustomEvent('hb-cart-updated', { detail: { cartId } }));
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

  const applyCouponCode = async (code: string) => {
    setCouponCode(code);
    localStorage.setItem(COUPON_KEY, code);
    setAppliedCoupon(code);
    if (!cartId) return;
    setLoading(true);
    await loadCart(cartId, code);
    setLoading(false);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className={`fixed inset-0 z-[70] bg-black/35 transition ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed right-0 top-0 z-[80] h-full w-full max-w-[390px] overflow-y-auto border-l border-[#E8DCCD] bg-[#F8EFE4] p-4 shadow-[-20px_0_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-black text-[#2A1E15]">Your Cart</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#7A624F]">{cart?.items?.length ?? 0} items</span>
            <button type="button" onClick={onClose} className="rounded-lg border border-[#DDCCBA] bg-white px-2 py-1 text-sm">
              ✕
            </button>
          </div>
        </div>

        {!cartId || !cart?.items?.length ? (
          <p className="rounded-xl border border-[#E5D7C7] bg-white/70 px-3 py-4 text-sm text-[#6A5441]">Cart is empty.</p>
        ) : (
          <div className="space-y-3">
            <div className="max-h-[52vh] space-y-2 overflow-auto pr-1">
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
                          <p className="text-sm font-bold text-[#5B821F]">Rs {price}</p>
                          <div className="inline-flex items-center rounded-full border border-[#E5D8C9] bg-white">
                            <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-0.5 text-sm text-[#5A4534]" disabled={loading}>
                              −
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.qty}</span>
                            <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-0.5 text-sm text-[#5A4534]" disabled={loading}>
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
                <button type="button" onClick={applyCoupon} className="rounded-xl bg-[#4B2E83] px-3 py-2 text-sm font-semibold text-white">
                  Apply
                </button>
              </div>
              {message ? <p className="mt-2 text-xs text-[#6A5543]">{message}</p> : null}
              {availableCoupons.length ? (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7C6551]">Available Offers</p>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((coupon) => (
                      <button
                        key={coupon.id}
                        type="button"
                        onClick={() => applyCouponCode(coupon.code)}
                        className="rounded-full border border-[#E2D4C4] bg-white px-3 py-1 text-xs font-semibold text-[#4B2E83]"
                      >
                        {coupon.code} • {coupon.discountPct}% OFF
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
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

            <Link href={`/checkout?cart_id=${cartId}`} onClick={onClose} className="block rounded-xl bg-[#5B821F] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_12px_26px_rgba(91,130,31,0.33)]">
              Go To Checkout
            </Link>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}
