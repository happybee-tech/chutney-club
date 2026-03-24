import { prisma } from '../_shared/db/prisma';

export async function applyCoupon(subtotal: number, couponCode?: string | null) {
  if (!couponCode) {
    return { code: null, discount: 0, valid: false, message: null } as const;
  }

  const normalized = couponCode.trim().toUpperCase();
  const now = new Date();

  const coupon = await prisma.couponCampaign.findFirst({
    where: {
      code: normalized,
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
  });

  if (!coupon) {
    return { code: normalized, discount: 0, valid: false, message: 'Invalid coupon code' } as const;
  }

  const minSubtotal = Number(coupon.minSubtotal ?? 0);
  if (subtotal < minSubtotal) {
    return {
      code: normalized,
      discount: 0,
      valid: false,
      message: `Minimum order value Rs ${minSubtotal} required`,
    } as const;
  }

  const rawDiscount = (subtotal * Number(coupon.discountPct)) / 100;
  const maxDiscount = coupon.maxDiscount != null ? Number(coupon.maxDiscount) : Number.MAX_SAFE_INTEGER;
  const discount = Math.min(rawDiscount, maxDiscount, subtotal);

  return { code: normalized, discount, valid: true, message: null } as const;
}

export async function listActiveCoupons() {
  const now = new Date();
  const items = await prisma.couponCampaign.findMany({
    where: {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      code: true,
      name: true,
      discountPct: true,
      minSubtotal: true,
      maxDiscount: true,
    },
  });

  return items.map((item) => ({
    ...item,
    discountPct: Number(item.discountPct),
    minSubtotal: Number(item.minSubtotal),
    maxDiscount: item.maxDiscount == null ? null : Number(item.maxDiscount),
  }));
}

