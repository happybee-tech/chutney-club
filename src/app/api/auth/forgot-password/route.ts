import { NextResponse } from 'next/server';
import { getSupabaseAnonClient } from '@/server/_shared/auth/supabase';
import { prisma } from '@/server/_shared/db/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'email is required' } },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return NextResponse.json(
      { success: false, error: { code: 'USER_NOT_FOUND', message: 'User does not exist with this email address.' } },
      { status: 404 }
    );
  }

  const origin = new URL(request.url).origin;
  const next = '/set-password?flow=recovery';
  const redirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = getSupabaseAnonClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_FORGOT_PASSWORD_FAILED', message: error.message } },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { message: 'A password reset link has been sent.' },
  });
}
