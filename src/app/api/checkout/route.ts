import { NextResponse } from 'next/server';
import { checkout } from '@/server/checkout/service';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

export async function POST(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const body = await request.json();
    const { cart_id, address_id, delivery_slot_id, community_id, location_id, coupon_code } = body;

    if (!cart_id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'cart_id is required' } },
        { status: 400 }
      );
    }

    const result = await checkout({
      userId: appUser.id,
      cartId: cart_id,
      addressId: address_id,
      deliverySlotId: delivery_slot_id,
      communityId: community_id,
      locationId: location_id,
      couponCode: coupon_code,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: { code: result.error, message: result.error, details: result.details } },
        { status: 400 }
      );
    }

    const { order, payment } = result.data;

    return NextResponse.json({
      success: true,
      data: {
        order_id: order.id,
        payment: {
          provider: payment.provider,
          provider_order_id: payment.providerOrderId,
          amount: payment.amount,
          currency: payment.currency,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}
