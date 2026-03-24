import { prisma } from '../_shared/db/prisma';

export async function listBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function listProducts(params: {
  brandId?: string;
  categoryId?: string;
  isPerishable?: boolean;
  page?: number;
  limit?: number;
}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(params.brandId ? { brandId: params.brandId } : {}),
    ...(typeof params.isPerishable === 'boolean' ? { isPerishable: params.isPerishable } : {}),
  } as const;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        variants: { where: { isActive: true } },
        images: true,
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
          ...(params.categoryId ? { where: { categoryId: params.categoryId } } : {}),
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const normalized = items.map((item) => {
    const activeVariants = [...item.variants].sort((a, b) => Number(a.price) - Number(b.price));
    const prices = activeVariants.map((v) => Number(v.price)).filter((p) => !Number.isNaN(p));
    const priceFrom = prices.length ? Math.min(...prices) : null;
    const defaultVariant = activeVariants[0]
      ? {
          id: activeVariants[0].id,
          name: activeVariants[0].name,
          price: Number(activeVariants[0].price),
        }
      : null;
    return {
      id: item.id,
      brandId: item.brandId,
      name: item.name,
      description: item.description,
      isPerishable: item.isPerishable,
      priceFrom,
      defaultVariant,
      image: item.images.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? null,
      categories: item.categories.map((c) => c.category),
    };
  });

  return { items: normalized, page, limit, total };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: {
      variants: { where: { isActive: true } },
      images: true,
      categories: {
        select: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    categories: product.categories.map((c) => c.category),
  };
}
