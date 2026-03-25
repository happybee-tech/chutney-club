import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';
import { syncSingleCartFromClient } from '@/server/cart/service';

type SyncItem = { variant_id: string; qty: number };

export async function POST(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const body = await request.json();
    const items = Array.isArray(body?.items) ? (body.items as SyncItem[]) : [];

    const normalizedItems = items
      .map((item) => ({
        variantId: String(item.variant_id || ''),
        qty: Math.max(1, Number(item.qty || 1)),
      }))
      .filter((item) => item.variantId);

    const result = await syncSingleCartFromClient({
      userId: appUser.id,
      items: normalizedItems,
    });
    return NextResponse.json({
      success: true,
      data: {
        ...result.cart,
        dropped_count: result.droppedCount,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Request failed';
    const isAuthError = message === 'UNAUTHORIZED';
    return NextResponse.json(
      { success: false, error: { code: message || 'ERROR', message } },
      { status: isAuthError ? 401 : 400 }
    );
  }
}
