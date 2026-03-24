import { NextResponse } from 'next/server';
import type { OrderStatus } from '@prisma/client';
import { listOrders } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

export async function GET(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const allowedStatuses: OrderStatus[] = [
    'created',
    'paid',
    'accepted',
    'preparing',
    'dispatched',
    'delivered',
    'cancelled',
    'refunded',
  ];
  const status: OrderStatus | undefined =
    statusParam && allowedStatuses.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined;
  const brandId = searchParams.get('brand_id') ?? undefined;
  if (!brandId) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'brand_id is required' } },
      { status: 400 }
    );
  }
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  const data = await listOrders({ status, brandId, page, limit });
  return NextResponse.json({ success: true, data });
}
