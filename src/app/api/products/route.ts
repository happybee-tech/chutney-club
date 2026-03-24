import { NextResponse } from 'next/server';
import { listProducts } from '@/server/catalog/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const brandId = searchParams.get('brand_id') ?? undefined;
  const categoryId = searchParams.get('category_id') ?? undefined;
  const perishableParam = searchParams.get('perishable');
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  const isPerishable =
    perishableParam === null ? undefined : perishableParam === 'true';

  const data = await listProducts({
    brandId,
    categoryId,
    isPerishable,
    page,
    limit,
  });

  return NextResponse.json({ success: true, data });
}
