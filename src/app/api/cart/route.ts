import { NextResponse } from 'next/server';
import { createCart } from '@/server/cart/service';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

export async function POST(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const body = await request.json();
    const { order_type, brand_id } = body;

    if (!order_type) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'order_type is required' } },
        { status: 400 }
      );
    }

    const cart = await createCart({
      userId: appUser.id,
      orderType: order_type,
      brandId: brand_id,
    });

    return NextResponse.json({ success: true, data: cart });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}
