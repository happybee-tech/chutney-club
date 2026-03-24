import { NextResponse } from 'next/server';
import { deleteCategory, updateCategory } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

type CategoryRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: CategoryRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;

  const body = await request.json();
  const { brand_id, name, slug, description, is_active } = body;

  const category = await updateCategory(id, {
    brandId: brand_id,
    name,
    slug,
    description,
    isActive: is_active,
  });

  return NextResponse.json({ success: true, data: category });
}

export async function DELETE(request: Request, context: CategoryRouteContext) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;
  const { id } = await context.params;

  const category = await deleteCategory(id);
  return NextResponse.json({ success: true, data: category });
}
