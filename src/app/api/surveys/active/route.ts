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

export async function GET(request: Request) {
  try {
    const token = readTokenFromRequest(request);
    let authUserId: string | null = null;
    
    if (token) {
       const supabase = getSupabaseAnonClient();
       const { data: { user } } = await supabase.auth.getUser(token);
       if (user) authUserId = user.id;
    }

    if (!authUserId) {
      return NextResponse.json({ survey: null });
    }

    const now = new Date();
    // Get the first active survey
    const activeSurvey = await prisma.survey.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!activeSurvey) {
      return NextResponse.json({ survey: null });
    }

    const alreadySubmitted = await prisma.surveyResponse.findFirst({
      where: {
        surveyId: activeSurvey.id,
        userId: authUserId,
      },
      select: { id: true },
    });

    if (alreadySubmitted) {
      return NextResponse.json({ survey: null });
    }

    return NextResponse.json({ survey: activeSurvey });
  } catch (error) {
    console.error('Fetch active survey error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
