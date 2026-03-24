type CouponRule = {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
};

const COUPONS: CouponRule[] = [
  { code: 'NEW10', type: 'percent', value: 10, minSubtotal: 199, maxDiscount: 100 },
  { code: 'HEALTH50', type: 'flat', value: 50, minSubtotal: 299 },
];

export function applyCoupon(subtotal: number, couponCode?: string | null) {
  if (!couponCode) {
    return { code: null, discount: 0, valid: false, message: null } as const;
  }

  const normalized = couponCode.trim().toUpperCase();
  const coupon = COUPONS.find((item) => item.code === normalized);
  if (!coupon) {
    return { code: normalized, discount: 0, valid: false, message: 'Invalid coupon code' } as const;
  }

  if (subtotal < coupon.minSubtotal) {
    return {
      code: normalized,
      discount: 0,
      valid: false,
      message: `Minimum order value Rs ${coupon.minSubtotal} required`,
    } as const;
  }

  const rawDiscount =
    coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  const discount = Math.min(rawDiscount, coupon.maxDiscount ?? Number.MAX_SAFE_INTEGER, subtotal);

  return { code: normalized, discount, valid: true, message: null } as const;
}
