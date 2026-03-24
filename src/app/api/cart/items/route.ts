import { NextResponse } from 'next/server';
import { addCartItem } from '@/server/cart/service';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

export async function POST(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const body = await request.json();
    const { cart_id, variant_id, qty } = body;

    if (!cart_id || !variant_id || !qty) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'cart_id, variant_id, qty are required' },
        },
        { status: 400 }
      );
    }

    const item = await addCartItem({
      userId: appUser.id,
      cartId: cart_id,
      variantId: variant_id,
      qty,
    });
    return NextResponse.json({ success: true, data: item });
  } catch (e: any) {
    const isAuthError = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { success: false, error: { code: e?.message ?? 'ERROR', message: e?.message ?? 'Request failed' } },
      { status: isAuthError ? 401 : 400 }
    );
  }
}
