import { NextResponse } from 'next/server';
import { validateCart } from '@/server/cart/service';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

export async function POST(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const body = await request.json();
    const { cart_id, delivery_slot_id, coupon_code } = body;

    if (!cart_id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'cart_id is required' } },
        { status: 400 }
      );
    }

    const result = await validateCart({
      userId: appUser.id,
      cartId: cart_id,
      deliverySlotId: delivery_slot_id,
      couponCode: coupon_code,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Request failed';
    const isAuthError = message === 'UNAUTHORIZED';
    return NextResponse.json(
      { success: false, error: { code: message || 'ERROR', message } },
      { status: isAuthError ? 401 : 400 }
    );
  }
}
