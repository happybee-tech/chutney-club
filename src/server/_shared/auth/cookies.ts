import { NextResponse } from 'next/server';

type SessionLike = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export function setAuthCookies(response: NextResponse, session: SessionLike) {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set('access_token', session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: session.expires_in,
  });
  response.cookies.set('refresh_token', session.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}
