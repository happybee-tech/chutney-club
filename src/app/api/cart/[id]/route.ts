import { NextResponse } from 'next/server';
import { getCartById } from '@/server/cart/service';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

type CartRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: CartRouteContext) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const { id } = await context.params;
    const cart = await getCartById({ userId: appUser.id, cartId: id });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: cart });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}
