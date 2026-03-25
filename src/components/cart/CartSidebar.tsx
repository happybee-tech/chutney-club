'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { getLocalCartItems, updateLocalCartItemQty } from '@/lib/localCart';

const COUPON_KEY = 'hb_cart_coupon';

type LocalCartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  qty: number;
  brandId: string;
  imageUrl?: string | null;
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
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [couponCode, setCouponCode] = useState(() =>
    typeof window === 'undefined' ? '' : localStorage.getItem(COUPON_KEY) ?? ''
  );
  const [appliedCoupon, setAppliedCoupon] = useState(() =>
    typeof window === 'undefined' ? '' : localStorage.getItem(COUPON_KEY) ?? ''
  );
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [couponsLoaded, setCouponsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncItems = () => {
      setItems(getLocalCartItems() as LocalCartItem[]);
    };
    syncItems();
    if (!open) return;
    const onCartUpdated = () => syncItems();
    window.addEventListener('hb-cart-updated', onCartUpdated as EventListener);
    window.addEventListener('storage', onCartUpdated);
    return () => {
      window.removeEventListener('hb-cart-updated', onCartUpdated as EventListener);
      window.removeEventListener('storage', onCartUpdated);
    };
  }, [open]);

  useEffect(() => {
    if (!open || couponsLoaded) return;
    fetch('/api/coupons', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (data?.success) {
          setAvailableCoupons((data.data ?? []) as AvailableCoupon[]);
        }
      })
      .catch(() => setAvailableCoupons([]))
      .finally(() => setCouponsLoaded(true));
  }, [open, couponsLoaded]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const rawSubtotal = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  }, [items]);

  const appliedCouponInfo = useMemo(() => {
    if (!appliedCoupon) return null;
    const code = appliedCoupon.trim().toUpperCase();
    return availableCoupons.find((coupon) => coupon.code.toUpperCase() === code) ?? null;
  }, [appliedCoupon, availableCoupons]);

  const discount = useMemo(() => {
    if (!appliedCouponInfo) return 0;
    if (rawSubtotal < Number(appliedCouponInfo.minSubtotal || 0)) return 0;
    const calc = (rawSubtotal * Number(appliedCouponInfo.discountPct || 0)) / 100;
    if (appliedCouponInfo.maxDiscount && appliedCouponInfo.maxDiscount > 0) {
      return Math.min(calc, Number(appliedCouponInfo.maxDiscount));
    }
    return calc;
  }, [appliedCouponInfo, rawSubtotal]);

  const total = Math.max(rawSubtotal - discount, 0);

  const updateQty = async (variantId: string, nextQty: number) => {
    setLoading(true);
    updateLocalCartItemQty(variantId, nextQty);
    setItems(getLocalCartItems() as LocalCartItem[]);
    setLoading(false);
  };

  const applyCoupon = async () => {
    const normalized = couponCode.trim().toUpperCase();
    localStorage.setItem(COUPON_KEY, normalized);
    setAppliedCoupon(normalized);
  };

  const applyCouponCode = async (code: string) => {
    setCouponCode(code);
    localStorage.setItem(COUPON_KEY, code);
    setAppliedCoupon(code);
  };

  if (typeof document === 'undefined') return null;

  const cartEmpty = !items.length;

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
            <span className="text-xs font-semibold text-[#7A624F]">{items.length} items</span>
            <button type="button" onClick={onClose} className="rounded-lg border border-[#DDCCBA] bg-white px-2 py-1 text-sm">
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-[#E5D7C7] bg-white/70 px-3 py-5 text-sm text-[#6A5441]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#5B821F] border-t-transparent" />
              Loading cart...
            </div>
          </div>
        ) : cartEmpty ? (
          <p className="rounded-xl border border-[#E5D7C7] bg-white/70 px-3 py-4 text-sm text-[#6A5441]">Cart is empty.</p>
        ) : (
          <div className="space-y-3">
            <div className="max-h-[52vh] space-y-2 overflow-auto pr-1">
              {items.map((item) => {
                const image = item.imageUrl || '/community-default.png';
                const price = Number(item.price);
                return (
                  <article key={item.variantId} className="rounded-2xl border border-[#E8DBCE] bg-white/80 p-2.5">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[#E5D8C9]">
                        <Image src={image} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#2B2018]">{item.productName}</p>
                        <p className="truncate text-xs text-[#6F5A48]">{item.variantName}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-sm font-bold text-[#5B821F]">Rs {price}</p>
                          <div className="inline-flex items-center rounded-full border border-[#E5D8C9] bg-white">
                            <button type="button" onClick={() => updateQty(item.variantId, item.qty - 1)} className="px-2 py-0.5 text-sm text-[#5A4534]" disabled={loading}>
                              −
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.qty}</span>
                            <button type="button" onClick={() => updateQty(item.variantId, item.qty + 1)} className="px-2 py-0.5 text-sm text-[#5A4534]" disabled={loading}>
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
                <span>Rs {rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#5A4533]">
                <span>Discount</span>
                <span>- Rs {discount.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-[#E6D8C9] pt-2 font-bold text-[#2A1D14]">
                <span>Total</span>
                <span>Rs {total.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={onClose} className="block rounded-xl bg-[#5B821F] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_12px_26px_rgba(91,130,31,0.33)]">
              Go To Checkout
            </Link>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}
