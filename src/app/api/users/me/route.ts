import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';
import { prisma } from '@/server/_shared/db/prisma';

export async function GET(request: Request) {
  try {
    const { authUser, appUser } = await requireAuthenticatedUser(request);
    return NextResponse.json({
      success: true,
      data: {
        id: appUser.id,
        email: appUser.email,
        phone: appUser.phone,
        name: appUser.name,
        role: appUser.role,
        auth: {
          emailVerifiedAt: authUser.email_confirmed_at,
          lastSignInAt: authUser.last_sign_in_at,
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

export async function PATCH(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    const body = await request.json();
    
    const updated = await prisma.user.update({
      where: { id: appUser.id },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Update failed' } },
      { status: 400 }
    );
  }
}
