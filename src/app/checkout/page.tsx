'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/sections/Footer';

const CART_KEY = 'hb_single_cart_id';
const COUPON_KEY = 'hb_cart_coupon';

type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  area?: string | null;
  city: string;
  pincode: string;
  type: string;
  isDefault: boolean;
};

type CartItem = {
  id: string;
  qty: number;
  priceSnapshot: string | number;
  variant: {
    name: string;
    product: {
      name: string;
      images?: Array<{ url: string }>;
    };
  };
};

type ValidateSummary = {
  subtotal: number;
  discount: number;
  total: number;
  coupon?: { code: string | null; valid: boolean; discount: number; message: string | null };
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [cartId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const queryCartId = new URLSearchParams(window.location.search).get('cart_id');
    return queryCartId || localStorage.getItem(CART_KEY);
  });
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [couponCode] = useState(() =>
    typeof window === 'undefined' ? '' : localStorage.getItem(COUPON_KEY) ?? ''
  );
  const [summary, setSummary] = useState<ValidateSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{ orderId: string; providerOrderId: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    area: '',
    city: 'Bangalore',
    pincode: '',
  });

  const loadCheckoutData = async (targetCartId: string, coupon: string) => {
    const [cartRes, addressRes, validateRes] = await Promise.all([
      fetch(`/api/cart/${targetCartId}`, { credentials: 'include', cache: 'no-store' }),
      fetch('/api/addresses', { credentials: 'include', cache: 'no-store' }),
      fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cart_id: targetCartId, coupon_code: coupon || undefined }),
      }),
    ]);

    const cartJson = await cartRes.json().catch(() => ({}));
    const addressesJson = await addressRes.json().catch(() => ({}));
    const validateJson = await validateRes.json().catch(() => ({}));

    if (cartRes.ok && cartJson?.success) {
      setItems(cartJson.data?.items ?? []);
    }

    if (addressRes.ok && addressesJson?.success) {
      const addressList = addressesJson.data ?? [];
      setAddresses(addressList);
      const defaultAddress = addressList.find((address: Address) => address.isDefault);
      setSelectedAddressId((current) => current || defaultAddress?.id || addressList[0]?.id || '');
    }

    if (validateRes.ok && validateJson?.success) {
      setSummary(validateJson.data?.summary ?? null);
      if (validateJson.data?.summary?.coupon?.message && !validateJson.data?.summary?.coupon?.valid) {
        setMessage(validateJson.data.summary.coupon.message);
      }
    }
  };

  useEffect(() => {
    const resolvedCartId = searchParams.get('cart_id') || cartId;
    if (!resolvedCartId) return;
    Promise.resolve()
      .then(() => loadCheckoutData(resolvedCartId, couponCode))
      .catch(() => setMessage('Failed to load checkout data'));
  }, [searchParams, cartId, couponCode]);

  const rawSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.qty, 0),
    [items]
  );
  const totals = summary ?? { subtotal: rawSubtotal, discount: 0, total: rawSubtotal };

  const handleAddressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...newAddress,
        is_default: addresses.length === 0,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      setMessage(data?.error?.message ?? 'Unable to add address');
      return;
    }

    setAddresses((current) => [data.data, ...current]);
    setSelectedAddressId(data.data.id);
    setNewAddress({ name: '', phone: '', line1: '', line2: '', area: '', city: 'Bangalore', pincode: '' });
    setMessage('Address added');
  };

  const handlePlaceOrder = async () => {
    if (!cartId) return;
    if (!selectedAddressId) {
      setMessage('Please select a delivery address.');
      return;
    }
    setSubmitting(true);
    setMessage(null);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        cart_id: cartId,
        address_id: selectedAddressId,
        coupon_code: couponCode || undefined,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      setMessage(data?.error?.message ?? 'Checkout failed');
      setSubmitting(false);
      return;
    }

    setOrderResult({
      orderId: data.data.order_id,
      providerOrderId: data.data.payment?.provider_order_id ?? '',
    });
    localStorage.removeItem(CART_KEY);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F5EBDD_0%,#F2E6D7_100%)] text-[#1F1B17]">
      <Header scrolled />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#E5D8C8] bg-white/75 p-5 shadow-[0_16px_40px_rgba(29,21,14,0.08)] backdrop-blur">
            <h1 className="text-3xl font-black text-[#2B1E15]">Checkout</h1>
            <p className="mt-1 text-sm text-[#6A5440]">Select delivery address and review order summary.</p>
          </div>

          <div className="rounded-3xl border border-[#E5D8C8] bg-white/75 p-5 shadow-[0_16px_40px_rgba(29,21,14,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#2B1E15]">Delivery Address</h2>
            </div>
            <div className="space-y-2">
              {addresses.map((address) => (
                <label key={address.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E5D8C8] bg-white/80 p-3">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#2A1D14]">
                      {address.name} • {address.phone}
                    </p>
                    <p className="text-xs text-[#6A5440]">
                      {address.line1}, {address.line2 ? `${address.line2}, ` : ''}
                      {address.area ? `${address.area}, ` : ''}
                      {address.city} - {address.pincode}
                    </p>
                  </div>
                </label>
              ))}
              {!addresses.length ? <p className="text-sm text-[#6A5440]">No address found. Add one below.</p> : null}
            </div>
          </div>

          <form onSubmit={handleAddressSubmit} className="rounded-3xl border border-[#E5D8C8] bg-white/75 p-5 shadow-[0_16px_40px_rgba(29,21,14,0.08)] backdrop-blur">
            <h3 className="text-lg font-black text-[#2B1E15]">Add New Address</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input value={newAddress.name} onChange={(e) => setNewAddress((s) => ({ ...s, name: e.target.value }))} required placeholder="Full name" className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none" />
              <input value={newAddress.phone} onChange={(e) => setNewAddress((s) => ({ ...s, phone: e.target.value }))} required placeholder="Phone" className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none" />
              <input value={newAddress.line1} onChange={(e) => setNewAddress((s) => ({ ...s, line1: e.target.value }))} required placeholder="Address line 1" className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none sm:col-span-2" />
              <input value={newAddress.line2} onChange={(e) => setNewAddress((s) => ({ ...s, line2: e.target.value }))} placeholder="Address line 2 (optional)" className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none sm:col-span-2" />
              <input value={newAddress.area} onChange={(e) => setNewAddress((s) => ({ ...s, area: e.target.value }))} placeholder="Area" className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none" />
              <input value={newAddress.city} onChange={(e) => setNewAddress((s) => ({ ...s, city: e.target.value }))} required placeholder="City" className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none" />
              <input value={newAddress.pincode} onChange={(e) => setNewAddress((s) => ({ ...s, pincode: e.target.value }))} required placeholder="Pincode" className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none" />
              <button type="submit" className="rounded-xl bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white">
                Save Address
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-[#E5D8C8] bg-white/80 p-4 shadow-[0_16px_40px_rgba(29,21,14,0.08)] backdrop-blur">
            <h2 className="mb-3 text-xl font-black text-[#2A1D14]">Order Summary</h2>
            <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
              {items.map((item) => {
                const image = item.variant.product.images?.[0]?.url || '/community-default.png';
                return (
                  <article key={item.id} className="flex gap-3 rounded-2xl border border-[#E8DBCE] bg-white p-2.5">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[#E5D8C9]">
                      <Image src={image} alt={item.variant.product.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#2B2018]">{item.variant.product.name}</p>
                      <p className="truncate text-xs text-[#6F5A48]">{item.variant.name}</p>
                      <p className="mt-1 text-xs text-[#5A4533]">
                        Qty {item.qty} • Rs {Number(item.priceSnapshot)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-[#E8DBCE] bg-white p-3 text-sm">
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

            <div className="mt-3 rounded-xl border border-[#E6D8C9] bg-white p-3 text-xs text-[#6C5644]">
              Applied coupon: <span className="font-semibold">{couponCode || 'None'}</span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || !items.length}
              className="mt-4 w-full rounded-xl bg-[#E67E22] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(230,126,34,0.33)] disabled:bg-[#D4B79D]"
            >
              {submitting ? 'Placing Order...' : 'Proceed to Payment'}
            </button>

            {message ? <p className="mt-3 text-sm text-[#6A5440]">{message}</p> : null}
            {orderResult ? (
              <div className="mt-3 rounded-xl border border-[#D8CCBF] bg-[#FFF6EB] p-3 text-sm text-[#5B4635]">
                Order created: <span className="font-semibold">{orderResult.orderId}</span>
                <br />
                Payment ref: <span className="font-semibold">{orderResult.providerOrderId || 'pending'}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
