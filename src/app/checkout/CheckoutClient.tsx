'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/sections/Footer';
import { SurveyModal } from '@/components/survey/SurveyModal';

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

type ActiveSurvey = {
  id?: string;
  linkTitle?: string;
  description?: string | null;
  questions?: Array<{
    id: string;
    question: string;
    type?: 'rating' | 'yes_no' | 'short_text' | 'long_text' | 'single_choice' | 'multi_choice';
    options?: string[] | null;
    ratingLabels?: string[] | null;
    isRequired?: boolean;
  }>;
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
  const [couponCode] = useState(() =>
    typeof window === 'undefined' ? '' : localStorage.getItem(COUPON_KEY) ?? ''
  );
  const [summary, setSummary] = useState<ValidateSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{ orderId: string; orderNo: string; providerOrderId: string } | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentConfirmationDone, setPaymentConfirmationDone] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<ActiveSurvey | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handlePlaceOrder = async () => {
    if (!cartId) return;
    setSubmitting(true);
    setMessage(null);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        cart_id: cartId,
        coupon_code: couponCode || undefined,
        fulfillment_type: 'pickup',
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
      orderNo: data.data.order_no ?? data.data.order_id,
      providerOrderId: data.data.payment?.provider_order_id ?? '',
    });
    setPaymentConfirmationDone(false);
    setPaymentRef('');
    setProofFile(null);
    localStorage.removeItem(CART_KEY);
    setSubmitting(false);
  };

  const upiPayment = useMemo(() => {
    if (!orderResult || totals.total <= 0) return null;
    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'YOUR_UPI_ID';
    const amount = totals.total.toFixed(2);
    const orderNote = orderResult.orderNo || `CART-${orderResult.orderId.slice(0, 8)}`;
    const params = new URLSearchParams({
      pa: upiId,
      pn: 'Chutney Club',
      am: amount,
      cu: 'INR',
      tn: orderNote,
    });
    const uri = `upi://pay?${params.toString()}`;
    const qrUrl = `https://quickchart.io/qr?size=320&text=${encodeURIComponent(uri)}`;
    return { uri, qrUrl, orderNote };
  }, [orderResult, totals.total]);

  const handleConfirmPayment = async () => {
    if (!orderResult?.orderId) return;
    setConfirmingPayment(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('order_id', orderResult.orderId);
      if (paymentRef.trim()) formData.append('payment_ref', paymentRef.trim());
      if (proofFile) formData.append('screenshot', proofFile);

      const response = await fetch('/api/checkout/confirm-payment', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        setMessage(data?.error?.message ?? 'Unable to submit payment confirmation');
        return;
      }

      setPaymentConfirmationDone(true);
      setMessage('Payment confirmation submitted. We will verify and update your order.');
    } catch {
      setMessage('Network error while submitting payment confirmation');
    } finally {
      setConfirmingPayment(false);
    }
  };

  useEffect(() => {
    if (!orderResult) return;
    fetch('/api/surveys/active', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setActiveSurvey(data?.survey ?? null))
      .catch(() => setActiveSurvey(null));
  }, [orderResult]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F5EBDD_0%,#F2E6D7_100%)] text-[#1F1B17]">
      <Header scrolled />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#E5D8C8] bg-white/80 p-6 shadow-[0_16px_40px_rgba(29,21,14,0.08)] backdrop-blur">
            <h1 className="text-3xl font-black text-[#2B1E15]">Checkout</h1>
            <p className="mt-1 text-sm text-[#6A5440]">Pickup orders only for now. Delivery will be enabled soon.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-2xl border border-[#5B821F] bg-[#EEF5E2] px-4 py-3 text-left"
              >
                <p className="text-sm font-bold text-[#2A1D14]">Pickup</p>
                <p className="mt-0.5 text-xs text-[#6A5440]">Available now</p>
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-2xl border border-[#E5D8C8] bg-white/70 px-4 py-3 text-left opacity-70"
              >
                <p className="text-sm font-bold text-[#2A1D14]">Delivery</p>
                <p className="mt-0.5 text-xs text-[#6A5440]">Coming soon</p>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5D8C8] bg-white/75 p-5 shadow-[0_16px_40px_rgba(29,21,14,0.08)] backdrop-blur">
            <h2 className="text-xl font-black text-[#2B1E15]">Pickup Details</h2>
            <p className="mt-2 text-sm text-[#6A5440]">
              Pickup location and time will be shared once payment confirmation is submitted.
            </p>
            {!!addresses.length ? (
              <p className="mt-2 text-xs text-[#8A735F]">Saved addresses ({addresses.length}) are kept for future delivery rollout.</p>
            ) : null}
          </div>
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
              className="mt-4 w-full rounded-xl bg-[#5B821F] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(91,130,31,0.33)] disabled:bg-[#D4B79D]"
            >
              {submitting ? 'Placing Order...' : 'Place Pickup Order'}
            </button>

            {message ? <p className="mt-3 text-sm text-[#6A5440]">{message}</p> : null}
            {orderResult ? (
              <div className="mt-3 rounded-xl border border-[#D8CCBF] bg-[#FFF6EB] p-3 text-sm text-[#5B4635]">
                Order created: <span className="font-semibold">{orderResult.orderId}</span>
                <br />
                Order no: <span className="font-semibold">{orderResult.orderNo}</span>
                <br />
                Payment ref: <span className="font-semibold">{orderResult.providerOrderId || 'pending'}</span>
              </div>
            ) : null}
            {orderResult ? (
              <div className="mt-3 rounded-xl border border-[#D8CCBF] bg-white p-3">
                {upiPayment ? (
                  <div className="mb-3 rounded-xl border border-[#E8DBCE] bg-white/90 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7C6551]">Pay Now</p>
                    <p className="mt-1 text-xs text-[#6A5543]">Order Ref: {upiPayment.orderNote}</p>
                    <a
                      href={upiPayment.uri}
                      className="mt-3 block rounded-xl bg-[#4B2E83] px-4 py-2 text-center text-sm font-semibold text-white"
                    >
                      Open UPI App
                    </a>
                    <div className="mt-3 flex justify-center">
                      <div className="rounded-xl border border-[#E4D6C8] bg-white p-2">
                        <img src={upiPayment.qrUrl} alt="UPI QR" width={220} height={220} />
                      </div>
                    </div>
                  </div>
                ) : null}
                <p className="text-sm font-semibold text-[#2B2018]">Payment Confirmation</p>
                <p className="mt-1 text-xs text-[#6A5440]">
                  After payment, upload proof (optional) or simply complete order.
                </p>
                <div className="mt-3 grid gap-2">
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="UPI transaction ID / reference (optional)"
                    className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    className="rounded-xl border border-[#E2D4C4] bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#EFE7DD] file:px-3 file:py-1.5 file:text-xs file:font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment || paymentConfirmationDone}
                    className="rounded-xl bg-[#4B2E83] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#B7A7D5]"
                  >
                    {paymentConfirmationDone ? 'Order Completed' : confirmingPayment ? 'Submitting...' : 'Complete Order'}
                  </button>
                  {paymentConfirmationDone ? (
                    <Link
                      href="/"
                      className="rounded-xl border border-[#D8CCBF] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#4B2E83]"
                    >
                      Back to Home
                    </Link>
                  ) : null}
                </div>
                {activeSurvey ? (
                  <div className="mt-4 rounded-xl border border-[#E4D7C8] bg-[#FFF6EB] p-3">
                    <p className="text-sm font-semibold text-[#2B2018]">{activeSurvey.linkTitle || 'Rate your order'}</p>
                    <p className="mt-1 text-xs text-[#6A5440]">Share quick feedback to help us improve your next bowl.</p>
                    <button
                      type="button"
                      onClick={() => setSurveyOpen(true)}
                      className="mt-3 rounded-lg bg-[#4B2E83] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Open Survey
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
      <SurveyModal isOpen={surveyOpen} onClose={() => setSurveyOpen(false)} survey={activeSurvey ?? undefined} />
    </main>
  );
}
