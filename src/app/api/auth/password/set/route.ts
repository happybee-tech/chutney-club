import { NextResponse } from 'next/server';
import { requireAuthenticatedUser, syncAppUser } from '@/server/_shared/auth/user';
import { getSupabaseServiceClient } from '@/server/_shared/auth/supabase';

export async function POST(request: Request) {
  const body = await request.json();
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const flow = body.flow === 'recovery' ? 'recovery' : 'signup';

  if (!password) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'password is required' } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'password must be at least 8 characters' } },
      { status: 400 }
    );
  }

  if (flow === 'signup' && !name) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'name is required' } },
      { status: 400 }
    );
  }

  try {
    const { authUser } = await requireAuthenticatedUser(request);
    const supabase = getSupabaseServiceClient();
    const userMetadata = name
      ? {
          ...(authUser.user_metadata ?? {}),
          full_name: name,
        }
      : undefined;

    const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
      password,
      ...(userMetadata ? { user_metadata: userMetadata } : {}),
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'AUTH_SET_PASSWORD_FAILED', message: error?.message ?? 'Failed to set password' },
        },
        { status: 400 }
      );
    }

    await syncAppUser(data.user);

    return NextResponse.json({
      success: true,
      data: { message: 'Password updated successfully' },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}
