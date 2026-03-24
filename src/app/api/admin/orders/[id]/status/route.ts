import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

type OrderStatusRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: OrderStatusRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;

  const body = await request.json();
  const { status, brand_id } = body;

  if (!status || !brand_id) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'status and brand_id are required' } },
      { status: 400 }
    );
  }

  try {
    const order = await updateOrderStatus(id, status, brand_id);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order status';
    if (message === 'ORDER_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found for selected brand' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ORDER_FAILED', message: 'Failed to update order status' } },
      { status: 400 }
    );
  }
}
