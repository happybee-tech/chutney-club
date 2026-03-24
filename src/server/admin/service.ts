import { prisma } from '../_shared/db/prisma';
import type { OrderStatus } from '@prisma/client';

export async function listBrandsAdmin() {
  return prisma.brand.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createBrand(input: {
  name: string;
  description?: string;
  minBulkQty?: number;
  minBulkValue?: number;
  bulkEnabled?: boolean;
  bulkPricing?: Record<string, unknown>;
}) {
  return prisma.brand.create({
    data: {
      name: input.name,
      description: input.description,
      minBulkQty: input.minBulkQty ?? 0,
      minBulkValue: input.minBulkValue ?? 0,
      bulkEnabled: input.bulkEnabled ?? false,
      bulkPricing: (input.bulkPricing as any) ?? undefined,
      isActive: true,
    },
  });
}

export async function updateBrand(id: string, input: {
  name?: string;
  description?: string;
  minBulkQty?: number;
  minBulkValue?: number;
  bulkEnabled?: boolean;
  bulkPricing?: Record<string, unknown> | null;
  isActive?: boolean;
}) {
  if (!id) {
    throw new Error('INVALID_BRAND_ID');
  }

  const result = await prisma.brand.updateMany({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      minBulkQty: input.minBulkQty,
      minBulkValue: input.minBulkValue,
      bulkEnabled: input.bulkEnabled,
      bulkPricing: input.bulkPricing === null ? null : (input.bulkPricing as any),
      isActive: input.isActive,
    },
  });

  if (!result.count) {
    throw new Error('BRAND_NOT_FOUND');
  }

  return prisma.brand.findUniqueOrThrow({ where: { id } });
}

export async function deleteBrand(id: string) {
  if (!id) {
    throw new Error('INVALID_BRAND_ID');
  }

  const exists = await prisma.brand.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!exists) {
    throw new Error('BRAND_NOT_FOUND');
  }

  return prisma.brand.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function listCategoriesAdmin(input?: { brandId?: string }) {
  return prisma.category.findMany({
    where: {
      ...(input?.brandId ? { brandId: input.brandId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      brand: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function createCategory(input: { brandId: string; name: string; slug: string; description?: string }) {
  return prisma.category.create({
    data: {
      brandId: input.brandId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      isActive: true,
    },
  });
}

export async function updateCategory(id: string, input: { brandId?: string; name?: string; slug?: string; description?: string; isActive?: boolean }) {
  return prisma.category.update({
    where: { id },
    data: {
      brandId: input.brandId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      isActive: input.isActive,
    },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function listProductsAdmin(input: { page?: number; limit?: number; brandId?: string }) {
  const page = input.page && input.page > 0 ? input.page : 1;
  const limit = input.limit && input.limit > 0 ? input.limit : 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(input.brandId ? { brandId: input.brandId } : {}),
  } as const;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: true,
        variants: true,
        images: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, page, limit, total };
}

export async function createProduct(input: {
  brandId: string;
  name: string;
  description?: string;
  isPerishable: boolean;
  categoryIds?: string[];
  variants: Array<{
    name: string;
    price: number | string;
    sku: string;
    unit?: string;
    prepTimeMinutes?: number;
    cutoffTime?: string;
    shelfLifeHours?: number;
    availableDays?: string[];
    calories?: number;
    proteinGrams?: number | string;
    carbsGrams?: number | string;
    fatGrams?: number | string;
  }>;
  images?: Array<{ url: string; sortOrder?: number }>;
}) {
  if (input.categoryIds?.length) {
    const allowed = await prisma.category.count({
      where: {
        id: { in: input.categoryIds },
        brandId: input.brandId,
      },
    });

    if (allowed !== input.categoryIds.length) {
      throw new Error('CATEGORY_BRAND_MISMATCH');
    }
  }

  return prisma.product.create({
    data: {
      brandId: input.brandId,
      name: input.name,
      description: input.description,
      isPerishable: input.isPerishable,
      categories: input.categoryIds?.length
        ? { create: input.categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
      variants: {
        create: input.variants.map((v) => ({
          name: v.name,
          price: v.price,
          sku: v.sku,
          unit: v.unit,
          prepTimeMinutes: v.prepTimeMinutes,
          cutoffTime: v.cutoffTime,
          shelfLifeHours: v.shelfLifeHours,
          availableDays: v.availableDays ?? [],
          calories: v.calories,
          proteinGrams: v.proteinGrams,
          carbsGrams: v.carbsGrams,
          fatGrams: v.fatGrams,
        })),
      },
      images: input.images?.length
        ? { create: input.images.map((img) => ({ url: img.url, sortOrder: img.sortOrder ?? 0 })) }
        : undefined,
    },
  });
}

export async function updateProduct(id: string, input: {
  name?: string;
  description?: string;
  isPerishable?: boolean;
  isActive?: boolean;
  categoryIds?: string[];
  variants?: Array<{
    name: string;
    price: number | string;
    sku: string;
    unit?: string;
    prepTimeMinutes?: number;
    cutoffTime?: string;
    shelfLifeHours?: number;
    availableDays?: string[];
    calories?: number;
    proteinGrams?: number | string;
    carbsGrams?: number | string;
    fatGrams?: number | string;
  }>;
  images?: Array<{ url: string; sortOrder?: number }>;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({
      where: { id },
      select: { brandId: true },
    });

    if (!existing) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const product = await tx.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        isPerishable: input.isPerishable,
        isActive: input.isActive,
      },
    });

    if (input.categoryIds) {
      const allowed = await tx.category.count({
        where: {
          id: { in: input.categoryIds },
          brandId: existing.brandId,
        },
      });

      if (allowed !== input.categoryIds.length) {
        throw new Error('CATEGORY_BRAND_MISMATCH');
      }

      await tx.productCategory.deleteMany({ where: { productId: id } });
      if (input.categoryIds.length) {
        await tx.productCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({ productId: id, categoryId })),
        });
      }
    }

    if (input.variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (input.variants.length) {
        await tx.productVariant.createMany({
          data: input.variants.map((v) => ({
            productId: id,
            name: v.name,
            price: v.price,
            sku: v.sku,
            unit: v.unit,
            prepTimeMinutes: v.prepTimeMinutes,
            cutoffTime: v.cutoffTime,
            shelfLifeHours: v.shelfLifeHours,
            availableDays: v.availableDays ?? [],
            calories: v.calories,
            proteinGrams: v.proteinGrams,
            carbsGrams: v.carbsGrams,
            fatGrams: v.fatGrams,
          })),
        });
      }
    }

    if (input.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length) {
        await tx.productImage.createMany({
          data: input.images.map((img) => ({
            productId: id,
            url: img.url,
            sortOrder: img.sortOrder ?? 0,
          })),
        });
      }
    }

    return product;
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function listOrders(input: { status?: OrderStatus; brandId: string; page?: number; limit?: number }) {
  const page = input.page && input.page > 0 ? input.page : 1;
  const limit = input.limit && input.limit > 0 ? input.limit : 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(input.status ? { status: input.status } : {}),
    brandId: input.brandId,
  } as const;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, page, limit, total };
}

export async function updateOrderStatus(id: string, status: OrderStatus, brandId: string) {
  const result = await prisma.order.updateMany({
    where: { id, brandId },
    data: { status },
  });

  if (!result.count) {
    throw new Error('ORDER_NOT_FOUND');
  }

  return prisma.order.findFirstOrThrow({
    where: { id, brandId },
  });
}
