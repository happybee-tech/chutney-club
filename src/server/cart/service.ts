import { prisma } from '../_shared/db/prisma';
import { calculateBulkPricing, calculateSinglePricing } from '../pricing/engine';
import { applyCoupon } from '../pricing/coupons';

export async function createCart(input: { userId: string; orderType: 'single' | 'bulk'; brandId?: string }) {
  return prisma.cart.create({
    data: {
      userId: input.userId,
      orderType: input.orderType,
      brandId: input.orderType === 'bulk' ? input.brandId ?? null : null,
    },
  });
}

export async function addCartItem(input: { userId: string; cartId: string; variantId: string; qty: number }) {
  const cart = await prisma.cart.findFirst({ where: { id: input.cartId, userId: input.userId } });
  if (!cart) throw new Error('CART_NOT_FOUND');

  const variant = await prisma.productVariant.findFirst({
    where: { id: input.variantId, isActive: true },
    include: { product: true },
  });
  if (!variant) throw new Error('VARIANT_NOT_FOUND');

  if (cart.orderType === 'bulk') {
    const brandId = cart.brandId ?? variant.product.brandId;
    if (brandId !== variant.product.brandId) throw new Error('BULK_BRAND_MISMATCH');
    if (!cart.brandId) {
      await prisma.cart.update({ where: { id: cart.id }, data: { brandId } });
    }
  }

  const item = await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: input.cartId, variantId: input.variantId } },
    update: { qty: input.qty, priceSnapshot: variant.price },
    create: {
      cartId: input.cartId,
      variantId: input.variantId,
      qty: input.qty,
      priceSnapshot: variant.price,
    },
  });

  return item;
}

export async function updateCartItem(input: { userId: string; itemId: string; qty: number }) {
  const item = await prisma.cartItem.findFirst({
    where: { id: input.itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== input.userId) throw new Error('CART_ITEM_NOT_FOUND');

  return prisma.cartItem.update({
    where: { id: input.itemId },
    data: { qty: input.qty },
  });
}

export async function removeCartItem(input: { userId: string; itemId: string }) {
  const item = await prisma.cartItem.findFirst({
    where: { id: input.itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== input.userId) throw new Error('CART_ITEM_NOT_FOUND');

  await prisma.cartItem.delete({ where: { id: input.itemId } });
}

export async function validateCart(input: { userId: string; cartId: string; deliverySlotId?: string; couponCode?: string }) {
  const cart = await prisma.cart.findFirst({
    where: { id: input.cartId, userId: input.userId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      brand: true,
    },
  });

  if (!cart) throw new Error('CART_NOT_FOUND');

  if (!cart.items.length) {
    return { valid: false, messages: ['Cart is empty'], summary: null };
  }

  // Bulk rules
  if (cart.orderType === 'bulk') {
    if (!cart.brandId) throw new Error('BULK_BRAND_REQUIRED');
    const brandId = cart.brandId;
    const mixed = cart.items.some((i) => i.variant.product.brandId !== brandId);
    if (mixed) throw new Error('BULK_BRAND_MISMATCH');

    const totalQty = cart.items.reduce((sum, i) => sum + i.qty, 0);
    const totalValue = cart.items.reduce(
      (sum, i) => sum + i.qty * Number(i.priceSnapshot),
      0
    );

    const minQty = cart.brand?.minBulkQty ?? 0;
    const minValue = Number(cart.brand?.minBulkValue ?? 0);

    const meetsQty = minQty > 0 ? totalQty >= minQty : false;
    const meetsValue = minValue > 0 ? totalValue >= minValue : false;

    if ((minQty > 0 || minValue > 0) && !(meetsQty || meetsValue)) {
      return {
        valid: false,
        messages: ['Brand MOQ not met'],
        summary: { subtotal: totalValue, total: totalValue },
      };
    }
  }

  const hasPerishable = cart.items.some((i) => i.variant.product.isPerishable);
  if (input.deliverySlotId) {
    const slot = await prisma.deliverySlot.findFirst({ where: { id: input.deliverySlotId } });
    if (!slot) throw new Error('SLOT_NOT_FOUND');

    if (slot.cutoffTime <= new Date()) {
      return { valid: false, messages: ['Delivery slot cutoff passed'], summary: null };
    }

    if (hasPerishable && slot.category === 'non_perishable') {
      return { valid: false, messages: ['Perishable items require perishable slot'], summary: null };
    }
    if (!hasPerishable && slot.category === 'perishable') {
      return { valid: false, messages: ['Non-perishable items require non-perishable slot'], summary: null };
    }
  }

  const items = cart.items.map((i) => ({
    qty: i.qty,
    priceSnapshot: Number(i.priceSnapshot),
  }));

  if (cart.orderType === 'bulk') {
    const pricing = calculateBulkPricing({
      items,
      bulkEnabled: cart.brand?.bulkEnabled ?? false,
      minBulkQty: cart.brand?.minBulkQty ?? 0,
      bulkPricing: (cart.brand?.bulkPricing as Record<string, unknown> | null) ?? undefined,
    });

    if (!pricing.ok) {
      const message = pricing.error === 'MOQ_NOT_MET' ? 'Brand MOQ not met' : 'Bulk ordering not enabled';
      return { valid: false, messages: [message], summary: null };
    }

    const coupon = applyCoupon(pricing.result.subtotal, input.couponCode);
    const finalDiscount = pricing.result.discount + coupon.discount;
    const finalTotal = Math.max(pricing.result.subtotal - finalDiscount, 0);
    return {
      valid: true,
      messages: coupon.valid || !coupon.code ? [] : [coupon.message ?? 'Coupon invalid'],
      summary: {
        ...pricing.result,
        discount: finalDiscount,
        total: finalTotal,
        coupon: { code: coupon.code, valid: coupon.valid, discount: coupon.discount, message: coupon.message },
      },
    };
  }

  const singlePricing = calculateSinglePricing(items);
  const coupon = applyCoupon(singlePricing.subtotal, input.couponCode);
  const finalDiscount = singlePricing.discount + coupon.discount;
  const finalTotal = Math.max(singlePricing.subtotal - finalDiscount, 0);
  return {
    valid: true,
    messages: coupon.valid || !coupon.code ? [] : [coupon.message ?? 'Coupon invalid'],
    summary: {
      ...singlePricing,
      discount: finalDiscount,
      total: finalTotal,
      coupon: { code: coupon.code, valid: coupon.valid, discount: coupon.discount, message: coupon.message },
    },
  };
}

export async function getCartById(input: { userId: string; cartId: string }) {
  const cart = await prisma.cart.findFirst({
    where: { id: input.cartId, userId: input.userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
      brand: true,
    },
  });

  return cart;
}
