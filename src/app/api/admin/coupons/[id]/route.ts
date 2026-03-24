import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';
import { deleteCouponAdmin, updateCouponAdmin } from '@/server/admin/service';

type CouponRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: CouponRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;

  const body = await request.json();
  const { code, name, discount_pct, min_subtotal, max_discount, starts_at, ends_at, is_active } = body ?? {};

  try {
    const data = await updateCouponAdmin(id, {
      code,
      name,
      discountPct: typeof discount_pct === 'number' ? discount_pct : undefined,
      minSubtotal: typeof min_subtotal === 'number' ? min_subtotal : undefined,
      maxDiscount: max_discount === null ? null : typeof max_discount === 'number' ? max_discount : undefined,
      startsAt: starts_at === null ? null : starts_at ? new Date(starts_at) : undefined,
      endsAt: ends_at === null ? null : ends_at ? new Date(ends_at) : undefined,
      isActive: typeof is_active === 'boolean' ? is_active : undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update coupon';
    return NextResponse.json({ success: false, error: { code: 'UPDATE_FAILED', message } }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: CouponRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;

  try {
    const data = await deleteCouponAdmin(id);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete coupon';
    return NextResponse.json({ success: false, error: { code: 'DELETE_FAILED', message } }, { status: 400 });
  }
}

