import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';

export async function GET(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const [
    brands,
    activeBrands,
    categories,
    activeCategories,
    products,
    activeProducts,
    orders,
    users,
  ] = await Promise.all([
    prisma.brand.count(),
    prisma.brand.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      brands,
      activeBrands,
      categories,
      activeCategories,
      products,
      activeProducts,
      orders,
      users,
    },
  });
}
