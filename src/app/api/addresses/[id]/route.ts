import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const { name, phone, line1, line2, area, city, pincode, type, is_default } = body ?? {};

    const existing = await prisma.address.findFirst({ where: { id, userId: appUser.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Address not found' } },
        { status: 404 }
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      if (is_default === true) {
        await tx.address.updateMany({
          where: { userId: appUser.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          name: name ?? undefined,
          phone: phone ?? undefined,
          line1: line1 ?? undefined,
          line2: line2 === undefined ? undefined : line2,
          area: area === undefined ? undefined : area,
          city: city ?? undefined,
          pincode: pincode ?? undefined,
          type: type ?? undefined,
          isDefault: is_default ?? undefined,
        },
      });
    });

    return NextResponse.json({ success: true, data: address });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const { id } = await context.params;

    const existing = await prisma.address.findFirst({ where: { id, userId: appUser.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Address not found' } },
        { status: 404 }
      );
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true, data: {} });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}
