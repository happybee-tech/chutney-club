import { NextResponse } from 'next/server';
import { getProductById } from '@/server/catalog/service';

type ProductDetailRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: ProductDetailRouteContext) {
  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: product });
}
