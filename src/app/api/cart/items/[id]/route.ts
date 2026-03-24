import { NextResponse } from 'next/server';
import { updateCartItem, removeCartItem } from '@/server/cart/service';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

type CartItemRouteContext = { params: Promise<{ id: string }> };
type ErrorShape = { message?: string };

export async function PATCH(request: Request, context: CartItemRouteContext) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const { qty } = body;

    if (!qty) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'qty is required' } },
        { status: 400 }
      );
    }

    const item = await updateCartItem({ userId: appUser.id, itemId: id, qty });
    return NextResponse.json({ success: true, data: item });
  } catch (e: unknown) {
    const error = e as ErrorShape;
    const isAuthError = error?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { success: false, error: { code: error?.message ?? 'ERROR', message: error?.message ?? 'Request failed' } },
      { status: isAuthError ? 401 : 400 }
    );
  }
}

export async function DELETE(request: Request, context: CartItemRouteContext) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const { id } = await context.params;
    await removeCartItem({ userId: appUser.id, itemId: id });
    return NextResponse.json({ success: true, data: {} });
  } catch (e: unknown) {
    const error = e as ErrorShape;
    const isAuthError = error?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { success: false, error: { code: error?.message ?? 'ERROR', message: error?.message ?? 'Request failed' } },
      { status: isAuthError ? 401 : 400 }
    );
  }
}
