import { NextResponse } from 'next/server';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseAnonClient } from '@/server/_shared/auth/supabase';
import { syncAppUser } from '@/server/_shared/auth/user';

type CallbackSessionData = {
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  user: SupabaseUser;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const refreshToken = searchParams.get('refresh_token');
  const accessToken = searchParams.get('access_token');
  const type = searchParams.get('type') as
    | 'signup'
    | 'magiclink'
    | 'recovery'
    | 'invite'
    | 'email'
    | 'email_change'
    | null;
  const providerError = searchParams.get('error');
  const providerErrorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') || '/';

  if (providerError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_PROVIDER_ERROR',
          message: providerErrorDescription ?? providerError,
        },
      },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAnonClient();
  let sessionData: CallbackSessionData | null = null;
  let authErrorMessage: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session || !data.user) {
      authErrorMessage = error?.message ?? 'Invalid auth code';
    } else {
      sessionData = {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
        user: data.user,
      };
    }
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error || !data.session || !data.user) {
      authErrorMessage = error?.message ?? 'Invalid token_hash or type';
    } else {
      sessionData = {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
        user: data.user,
      };
    }
  } else if (accessToken && refreshToken) {
    // Fallback for query-style token callback.
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error || !data.session || !data.user) {
      authErrorMessage = error?.message ?? 'Invalid access_token/refresh_token';
    } else {
      sessionData = {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
        user: data.user,
      };
    }
  } else {
    const html = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Signing in...</title></head>
  <body>
    <script>
      (function () {
        var hash = window.location.hash ? window.location.hash.slice(1) : '';
        if (!hash) {
          document.body.textContent = 'Auth callback parameters missing.';
          return;
        }
        var params = new URLSearchParams(hash);
        var accessToken = params.get('access_token');
        var refreshToken = params.get('refresh_token');
        var type = params.get('type');
        var url = new URL(window.location.href);
        var next = params.get('next') || url.searchParams.get('next') || '/';
        if (!accessToken || !refreshToken) {
          document.body.textContent = 'Auth callback token parsing failed.';
          return;
        }
        url.searchParams.set('access_token', accessToken);
        url.searchParams.set('refresh_token', refreshToken);
        if (type) url.searchParams.set('type', type);
        url.searchParams.set('next', next);
        url.hash = '';
        window.location.replace(url.toString());
      })();
    </script>
  </body>
</html>`;
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!sessionData) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_CALLBACK_FAILED',
          message: authErrorMessage ?? 'Invalid callback',
          details: {
            hasCode: Boolean(code),
            hasTokenHash: Boolean(tokenHash),
            type,
          },
        },
      },
      { status: 400 }
    );
  }

  try {
    await syncAppUser(sessionData.user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync app user';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_USER_SYNC_FAILED',
          message,
        },
      },
      { status: 500 }
    );
  }

  const secure = process.env.NODE_ENV === 'production';
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set('access_token', sessionData.session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: sessionData.session.expires_in,
  });
  response.cookies.set('refresh_token', sessionData.session.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
