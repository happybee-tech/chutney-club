import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';
import { MENU_SHOWCASE_ITEMS } from '@/lib/menuShowcase';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const itemId = typeof body?.item_id === 'string' ? body.item_id : '';

  if (!itemId) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'item_id is required' } },
      { status: 400 }
    );
  }

  const menuItem = MENU_SHOWCASE_ITEMS.find((item) => item.id === itemId && !item.comingSoon);
  if (!menuItem) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Menu item not found' } },
      { status: 404 }
    );
  }

  const lookups = (menuItem.lookupNames?.length ? menuItem.lookupNames : [menuItem.name]).map((name) =>
    name.trim()
  );

  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: lookups.map((name) => ({
        name: { contains: name, mode: 'insensitive' },
      })),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
    },
  });

  const variant = product?.variants?.[0];
  if (!product || !variant) {
    return NextResponse.json(
      { success: false, error: { code: 'VARIANT_NOT_FOUND', message: 'No active variant found for this menu item' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      product_id: product.id,
      brand_id: product.brandId,
      variant_id: variant.id,
      price: Number(variant.price),
    },
  });
}
