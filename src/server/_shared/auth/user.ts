import type { User as SupabaseUser } from '@supabase/supabase-js';
import { prisma } from '../db/prisma';
import { getSupabaseAnonClient } from './supabase';

function readTokenFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const tokenCookie = cookies.find((c) => c.startsWith('access_token='));
  if (!tokenCookie) return null;
  return decodeURIComponent(tokenCookie.split('=').slice(1).join('='));
}

export async function syncAppUser(authUser: SupabaseUser) {
  const phone = authUser.phone || null;
  const email = authUser.email || null;
  const fullName =
    typeof authUser.user_metadata?.full_name === 'string' &&
    authUser.user_metadata.full_name.trim() !== ''
      ? authUser.user_metadata.full_name
      : null;

  try {
    return await prisma.user.upsert({
      where: { id: authUser.id },
      create: {
        id: authUser.id,
        email,
        phone,
        name: fullName,
        isActive: true,
      },
      update: {
        email,
        phone,
        name: fullName,
        isActive: true,
      },
    });
  } catch (error: any) {
    // If email or phone already exists under a previously-created app user,
    // reuse that user so login can complete.
    if (error?.code === 'P2002') {
      const orConditions: any[] = [];
      if (email) orConditions.push({ email });
      if (phone) orConditions.push({ phone });

      if (orConditions.length > 0) {
        const existing = await prisma.user.findFirst({
          where: { OR: orConditions },
        });
        if (existing) {
          return prisma.user.update({
            where: { id: existing.id },
            data: {
              email: existing.email || email,
              phone: existing.phone || phone,
              name: fullName || existing.name,
              isActive: true,
            },
          });
        }
      }
    }
    throw error;
  }
}

export async function requireAuthenticatedUser(request: Request) {
  const token = readTokenFromRequest(request);
  if (!token) throw new Error('UNAUTHORIZED');

  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error('UNAUTHORIZED');

  const appUser = await syncAppUser(data.user);
  return { authUser: data.user, appUser };
}
