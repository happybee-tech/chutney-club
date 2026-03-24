import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';
import { reorderProducts } from '@/server/admin/service';

export async function PATCH(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const brandId = typeof body?.brand_id === 'string' ? body.brand_id : '';
  const productIds = Array.isArray(body?.product_ids) ? body.product_ids : [];

  if (!brandId || !productIds.length) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'brand_id and product_ids are required' },
      },
      { status: 400 }
    );
  }

  try {
    const data = await reorderProducts({ brandId, productIds });
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reorder products';
    const isValidation =
      message === 'BRAND_ID_REQUIRED' ||
      message === 'PRODUCT_IDS_REQUIRED' ||
      message === 'PRODUCT_BRAND_MISMATCH';

    return NextResponse.json(
      { success: false, error: { code: isValidation ? 'VALIDATION_ERROR' : 'REORDER_FAILED', message } },
      { status: isValidation ? 400 : 500 }
    );
  }
}

