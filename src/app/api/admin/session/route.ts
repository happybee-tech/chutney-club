import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/server/_shared/auth/user';

export async function GET(request: Request) {
  try {
    const { appUser } = await requireAuthenticatedUser(request);
    if (appUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: appUser.id,
          email: appUser.email,
          name: appUser.name,
          role: appUser.role,
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
