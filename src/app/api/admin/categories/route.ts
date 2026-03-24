import { NextResponse } from 'next/server';
import { createCategory, listCategoriesAdmin } from '@/server/admin/service';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

export async function GET(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brand_id') ?? undefined;

  const data = await listCategoriesAdmin({ brandId });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const body = await request.json();
  const { brand_id, name, slug, description } = body;

  if (!brand_id || !name || !slug) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'brand_id, name and slug are required' } },
      { status: 400 }
    );
  }

  const category = await createCategory({ brandId: brand_id, name, slug, description });
  return NextResponse.json({ success: true, data: category });
}
