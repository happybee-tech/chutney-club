import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';
import { getSupabaseServiceClient } from '@/server/_shared/auth/supabase';

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extFromName(name: string) {
  const parts = name.split('.');
  if (parts.length < 2) return 'jpg';
  return parts[parts.length - 1].toLowerCase();
}

export async function POST(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const form = await request.formData();

    const orderId = String(form.get('order_id') ?? '').trim();
    const paymentRef = String(form.get('payment_ref') ?? '').trim();
    const screenshot = form.get('screenshot');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'order_id is required' } },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: appUser.id },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    let screenshotUrl: string | null = null;
    if (screenshot instanceof File && screenshot.size > 0) {
      if (!screenshot.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Screenshot must be an image' } },
          { status: 400 }
        );
      }

      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'brand-assets-public';
      const supabase = getSupabaseServiceClient();
      const original = sanitizeFileName(screenshot.name || 'payment-proof');
      const ext = extFromName(original);
      const base = original.replace(new RegExp(`\\.${ext}$`), '') || 'payment-proof';
      const fileName = `${base}-${crypto.randomUUID()}.${ext}`;
      const path = `payments/${appUser.id}/${orderId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, screenshot, { contentType: screenshot.type, upsert: false });

      if (uploadError) {
        return NextResponse.json(
          { success: false, error: { code: 'UPLOAD_FAILED', message: uploadError.message } },
          { status: 400 }
        );
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      screenshotUrl = data.publicUrl;
    }

    const latestPayment = order.payments[0];
    if (latestPayment) {
      const currentMetadata =
        latestPayment.metadata && typeof latestPayment.metadata === 'object'
          ? (latestPayment.metadata as Record<string, unknown>)
          : {};

      await prisma.payment.update({
        where: { id: latestPayment.id },
        data: {
          metadata: {
            ...currentMetadata,
            manual_confirmation: {
              submittedAt: new Date().toISOString(),
              paymentRef: paymentRef || null,
              screenshotUrl,
              source: 'checkout_confirm',
            },
          },
        },
      });
    }

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        eventType: 'payment_confirmation_submitted',
        payload: {
          byUserId: appUser.id,
          paymentRef: paymentRef || null,
          screenshotUrl,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: order.id,
        payment_ref: paymentRef || null,
        screenshot_url: screenshotUrl,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}

