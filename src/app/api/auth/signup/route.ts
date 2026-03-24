import { NextResponse } from 'next/server';
import { getSupabaseAnonClient } from '@/server/_shared/auth/supabase';

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'email is required' } },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const next = '/complete-signup';
  const emailRedirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = getSupabaseAnonClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_SIGNUP_START_FAILED', message: error.message } },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { message: 'Sign up link sent. Please check your inbox.' },
  });
}
