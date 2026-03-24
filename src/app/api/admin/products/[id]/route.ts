import { NextResponse } from 'next/server';
import { deleteProduct, updateProduct } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

type ProductRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: ProductRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;

  const body = await request.json();
  const { name, description, is_perishable, is_out_of_stock, is_active, category_ids, variants, images } = body;

  try {
    const product = await updateProduct(id, {
      name,
      description,
      isPerishable: is_perishable,
      isOutOfStock: is_out_of_stock,
      isActive: is_active,
      categoryIds: category_ids,
      variants,
      images,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    if (message === 'CATEGORY_BRAND_MISMATCH') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'selected categories must belong to this product brand' } },
        { status: 400 }
      );
    }
    if (message === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'product not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_PRODUCT_FAILED', message } },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, context: ProductRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;

  const product = await deleteProduct(id);
  return NextResponse.json({ success: true, data: product });
}
