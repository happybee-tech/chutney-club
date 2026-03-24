import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';
import { getSupabaseAnonClient } from '@/server/_shared/auth/supabase';

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const body = await request.json();
    const { ratings } = body; 

    if (!ratings || !Array.isArray(ratings)) {
      return NextResponse.json({ error: 'Invalid ratings format' }, { status: 400 });
    }

    // Attempt to identify user
    let userId = null;
    const token = readTokenFromRequest(request);
    if (token) {
       const supabase = getSupabaseAnonClient();
       const { data: { user } } = await supabase.auth.getUser(token);
       if (user) {
         userId = user.id; // app user id matches supabase auth user id
       }
    }

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId,
        userId,
        answers: {
          create: ratings.map((r: any) => ({
             questionId: r.questionId,
             rating: r.rating
          }))
        }
      }
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error('Submit survey error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
