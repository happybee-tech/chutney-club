import { NextResponse } from 'next/server';

export async function POST() {
  const secure = process.env.NODE_ENV === 'production';
  const response = NextResponse.json({ success: true, data: {} });
  response.cookies.set('access_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });
  return response;
}
