import { NextResponse } from 'next/server';
import { deleteBrand, updateBrand } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

type BrandRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: BrandRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Brand id is required' } },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, min_bulk_qty, min_bulk_value, bulk_enabled, bulk_pricing, is_active } = body;

    const brand = await updateBrand(id, {
      name,
      description,
      minBulkQty: min_bulk_qty,
      minBulkValue: min_bulk_value,
      bulkEnabled: bulk_enabled,
      bulkPricing: bulk_pricing,
      isActive: is_active,
    });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update brand';
    if (message === 'BRAND_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Brand not found' } },
        { status: 404 }
      );
    }
    console.error('Brand update failed', error);
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: 'Unable to update brand' } },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, context: BrandRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Brand id is required' } },
      { status: 400 }
    );
  }

  try {
    const brand = await deleteBrand(id);
    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete brand';
    if (message === 'BRAND_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Brand not found' } },
        { status: 404 }
      );
    }
    console.error('Brand delete failed', error);
    return NextResponse.json({ success: false, error: { code: 'DELETE_FAILED', message: 'Unable to delete brand' } }, { status: 400 });
  }
}
