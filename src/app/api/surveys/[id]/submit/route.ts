import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
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
    const answers = Array.isArray(body?.answers)
      ? body.answers
      : Array.isArray(body?.ratings)
        ? body.ratings.map((r: unknown) => {
            const ratingInput = (r ?? {}) as Record<string, unknown>;
            return { questionId: ratingInput.questionId, rating: ratingInput.rating };
          })
        : null;

    if (!answers || !Array.isArray(answers) || !answers.length) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
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

    if (userId) {
      const existing = await prisma.surveyResponse.findFirst({
        where: { surveyId, userId },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'SURVEY_ALREADY_SUBMITTED' },
          { status: 409 }
        );
      }
    }

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId,
        userId,
      }
    });

    const payload: Prisma.SurveyAnswerCreateManyInput[] = [];
    for (const raw of answers) {
      const answer = (raw ?? {}) as Record<string, unknown>;
      const questionId = typeof answer.questionId === 'string' ? answer.questionId : '';
      if (!questionId) continue;
      payload.push({
        responseId: response.id,
        questionId,
        rating: typeof answer.rating === 'number' ? answer.rating : null,
        boolValue: typeof answer.boolValue === 'boolean' ? answer.boolValue : null,
        textValue: typeof answer.textValue === 'string' ? answer.textValue : null,
        optionValue: typeof answer.optionValue === 'string' ? answer.optionValue : null,
        optionValues: Array.isArray(answer.optionValues)
          ? (answer.optionValues as Prisma.InputJsonValue)
          : undefined,
      });
    }

    if (payload.length) {
      await prisma.surveyAnswer.createMany({ data: payload });
    }

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error('Submit survey error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
