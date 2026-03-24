import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '../auth/user';

function hasValidAdminKey(request: Request) {
  const expected = process.env.ADMIN_API_KEY;
  const provided = request.headers.get('x-admin-key');
  return Boolean(expected && provided === expected);
}

export async function requireAdminAccess(request: Request) {
  // Backward-compatible path for script-based admin calls.
  if (hasValidAdminKey(request)) {
    return null;
  }

  try {
    const { appUser } = await requireAuthenticatedUser(request);
    if (appUser.role === 'admin') return null;

    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access denied' } },
      { status: 403 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    );
  }
}
