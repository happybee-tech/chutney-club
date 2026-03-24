import { NextResponse } from 'next/server';
import { getSupabaseAnonClient } from '@/server/_shared/auth/supabase';
import { syncAppUser } from '@/server/_shared/auth/user';
import { setAuthCookies } from '@/server/_shared/auth/cookies';

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'email and password are required' } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_SIGNIN_FAILED', message: error?.message ?? 'Invalid login' } },
      { status: 401 }
    );
  }

  await syncAppUser(data.user);

  const response = NextResponse.json({
    success: true,
    data: {
      user: data.user,
      message: 'Sign in successful',
    },
  });

  setAuthCookies(response, data.session);
  return response;
}
