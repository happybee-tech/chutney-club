import { NextResponse } from 'next/server';
import { listCategories } from '@/server/catalog/categories';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brand_id') ?? undefined;
  const categories = await listCategories({ brandId });
  return NextResponse.json({ success: true, data: categories });
}
