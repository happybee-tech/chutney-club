import { Prisma } from '@prisma/client';
import { prisma } from '../_shared/db/prisma';
import { validateCart } from '../cart/service';
import { calculateBulkPricing, calculateSinglePricing, coerceBulkPricing } from '../pricing/engine';
import { applyCoupon } from '../pricing/coupons';

function generateOrderNo() {
  const randomTenDigits = Math.floor(Math.random() * 10_000_000_000)
    .toString()
    .padStart(10, '0');
  return `ORD${randomTenDigits}`;
}

export async function checkout(input: {
  userId: string;
  cartId: string;
  addressId?: string;
  deliverySlotId?: string;
  communityId?: string;
  locationId?: string;
  couponCode?: string;
  fulfillmentType?: 'pickup' | 'delivery';
}) {
  const fulfillmentType = input.fulfillmentType ?? 'pickup';

  const validation = await validateCart({
    userId: input.userId,
    cartId: input.cartId,
    deliverySlotId: input.deliverySlotId,
    couponCode: input.couponCode,
  });

  if (!validation.valid) {
    return { ok: false, error: 'CART_INVALID', details: validation } as const;
  }

  const cart = await prisma.cart.findFirst({
    where: { id: input.cartId, userId: input.userId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      brand: true,
    },
  });

  if (!cart) {
    return { ok: false, error: 'CART_NOT_FOUND' } as const;
  }

  if (!cart.items.length) {
    return { ok: false, error: 'CART_EMPTY' } as const;
  }

  if (fulfillmentType === 'delivery' && !input.addressId) {
    return { ok: false, error: 'DELIVERY_ADDRESS_REQUIRED' } as const;
  }

  if (cart.orderType === 'bulk') {
    if (!input.communityId) {
      return { ok: false, error: 'BULK_COMMUNITY_REQUIRED' } as const;
    }
    if (!cart.brandId) {
      return { ok: false, error: 'BULK_BRAND_REQUIRED' } as const;
    }
  }

  const items = cart.items.map((i) => ({
    qty: i.qty,
    priceSnapshot: Number(i.priceSnapshot),
  }));

  const pricing =
    cart.orderType === 'bulk'
      ? calculateBulkPricing({
          items,
          bulkEnabled: cart.brand?.bulkEnabled ?? false,
          minBulkQty: cart.brand?.minBulkQty ?? 0,
          bulkPricing: coerceBulkPricing(cart.brand?.bulkPricing),
        })
      : ({ ok: true as const, result: calculateSinglePricing(items) });

  if (!pricing.ok) {
    return { ok: false, error: pricing.error } as const;
  }

  const coupon = await applyCoupon(pricing.result.subtotal, input.couponCode);
  const discount = pricing.result.discount + coupon.discount;
  const subtotal = pricing.result.subtotal;
  const total = Math.max(subtotal - discount, 0);

  const result = await prisma.$transaction(async (tx) => {
    let order: Awaited<ReturnType<typeof tx.order.create>> | null = null;
    let attempts = 0;
    while (!order && attempts < 5) {
      attempts += 1;
      try {
        order = await tx.order.create({
          data: {
            orderNo: generateOrderNo(),
            userId: cart.userId,
            brandId: cart.brandId,
            orderType: cart.orderType,
            subtotal,
            discount,
            total,
            deliverySlotId: input.deliverySlotId ?? null,
            addressId: fulfillmentType === 'delivery' ? input.addressId ?? null : null,
            communityId: input.communityId ?? null,
            locationId: input.locationId ?? null,
          },
        });
      } catch (error) {
        const isDuplicateOrderNo =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          (error.meta?.target as string[]).includes('orderNo');
        if (!isDuplicateOrderNo) throw error;
      }
    }

    if (!order) {
      throw new Error('ORDER_NO_GENERATION_FAILED');
    }

    const byBrand = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const itemBrandId = item.variant.product.brandId;
      const list = byBrand.get(itemBrandId) ?? [];
      list.push(item);
      byBrand.set(itemBrandId, list);
    }

    for (const [brandId, itemsForBrand] of byBrand.entries()) {
      const brandSubtotal = itemsForBrand.reduce(
        (sum, i) => sum + i.qty * Number(i.priceSnapshot),
        0
      );
      const ratio = subtotal > 0 ? brandSubtotal / subtotal : 0;
      const brandDiscount = discount * ratio;
      const brandTotal = brandSubtotal - brandDiscount;

      const subOrder = await tx.subOrder.create({
        data: {
          orderId: order.id,
          brandId,
          subtotal: brandSubtotal,
          discount: brandDiscount,
          total: brandTotal,
        },
      });

      await tx.orderItem.createMany({
        data: itemsForBrand.map((i) => ({
          orderId: order.id,
          subOrderId: subOrder.id,
          variantId: i.variantId,
          qty: i.qty,
          priceSnapshot: i.priceSnapshot,
          isPerishable: i.variant.product.isPerishable,
        })),
      });
    }

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        currency: 'INR',
        provider: 'razorpay',
        providerOrderId: `local_${order.id}`,
        method: 'unknown',
        status: 'created',
        amount: total,
        metadata: coupon.code
          ? {
              coupon: {
                code: coupon.code,
                valid: coupon.valid,
                discount: coupon.discount,
              },
            }
          : undefined,
      },
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: { status: 'converted' },
    });

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        eventType: 'fulfillment_selected',
        payload: {
          fulfillmentType,
          addressId: fulfillmentType === 'delivery' ? input.addressId ?? null : null,
        },
      },
    });

    return { order, payment };
  });

  return { ok: true, data: result } as const;
}
