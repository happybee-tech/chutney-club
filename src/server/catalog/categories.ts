import { prisma } from '../_shared/db/prisma';

export async function listCategories(params?: { brandId?: string }) {
  return prisma.category.findMany({
    where: {
      isActive: true,
      ...(params?.brandId ? { brandId: params.brandId } : {}),
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      brandId: true,
      name: true,
      slug: true,
      description: true,
    },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findFirst({
    where: { id, isActive: true },
  });
}
