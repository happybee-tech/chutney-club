import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

export async function GET(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const addresses = await prisma.address.findMany({
      where: { userId: appUser.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: addresses });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const body = await request.json();
    const { name, phone, line1, line2, area, city, pincode, type, is_default } = body ?? {};

    if (!name || !phone || !line1 || !pincode) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'name, phone, line1, pincode are required' } },
        { status: 400 }
      );
    }

    const shouldSetDefault = Boolean(is_default);

    const address = await prisma.$transaction(async (tx) => {
      if (shouldSetDefault) {
        await tx.address.updateMany({
          where: { userId: appUser.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const existingCount = await tx.address.count({ where: { userId: appUser.id } });

      return tx.address.create({
        data: {
          userId: appUser.id,
          name,
          phone,
          line1,
          line2: line2 ?? null,
          area: area ?? null,
          city: city ?? 'Bangalore',
          pincode,
          type: type ?? 'home',
          isDefault: shouldSetDefault || existingCount === 0,
        },
      });
    });

    return NextResponse.json({ success: true, data: address });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { success: false, error: { code: 'ERROR', message } },
      { status: 400 }
    );
  }
}
