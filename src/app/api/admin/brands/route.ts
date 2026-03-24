import { NextResponse } from 'next/server';
import { createBrand, listBrandsAdmin } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

export async function GET(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const data = await listBrandsAdmin();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const body = await request.json();
  const { name, description, min_bulk_qty, min_bulk_value, bulk_enabled, bulk_pricing } = body;

  if (!name) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'name is required' } },
      { status: 400 }
    );
  }

  const brand = await createBrand({
    name,
    description,
    minBulkQty: min_bulk_qty,
    minBulkValue: min_bulk_value,
    bulkEnabled: bulk_enabled,
    bulkPricing: bulk_pricing,
  });

  return NextResponse.json({ success: true, data: brand });
}
