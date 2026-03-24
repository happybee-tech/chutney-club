import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';
import { createCouponAdmin, listCouponsAdmin } from '@/server/admin/service';

export async function GET(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const data = await listCouponsAdmin();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const body = await request.json();
  const { code, name, discount_pct, min_subtotal, max_discount, starts_at, ends_at, is_active } = body ?? {};

  if (!code || !name || typeof discount_pct !== 'number') {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'code, name, discount_pct are required' } },
      { status: 400 }
    );
  }

  try {
    const data = await createCouponAdmin({
      code,
      name,
      discountPct: discount_pct,
      minSubtotal: typeof min_subtotal === 'number' ? min_subtotal : 0,
      maxDiscount: typeof max_discount === 'number' ? max_discount : null,
      startsAt: starts_at ? new Date(starts_at) : null,
      endsAt: ends_at ? new Date(ends_at) : null,
      isActive: is_active !== false,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create coupon';
    return NextResponse.json({ success: false, error: { code: 'CREATE_FAILED', message } }, { status: 400 });
  }
}

