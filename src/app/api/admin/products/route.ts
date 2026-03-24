import { NextResponse } from 'next/server';
import { createProduct, listProductsAdmin } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

export async function GET(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brand_id') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  const data = await listProductsAdmin({ page, limit, brandId });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const body = await request.json();
  const { brand_id, name, description, is_perishable, category_ids, variants, images } = body;

  if (!brand_id || !name || typeof is_perishable !== 'boolean' || !Array.isArray(variants) || !variants.length) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'brand_id, name, is_perishable, variants are required' } },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct({
      brandId: brand_id,
      name,
      description,
      isPerishable: is_perishable,
      categoryIds: category_ids,
      variants,
      images,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    if (message === 'CATEGORY_BRAND_MISMATCH') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'selected categories must belong to the same brand' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_PRODUCT_FAILED', message } },
      { status: 400 }
    );
  }
}
