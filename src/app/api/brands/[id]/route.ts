import { NextResponse } from 'next/server';
import { getBrandById } from '@/server/catalog/categories';

type BrandDetailRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: BrandDetailRouteContext) {
  const { id } = await context.params;
  const brand = await getBrandById(id);
  if (!brand) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Brand not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: brand });
}
