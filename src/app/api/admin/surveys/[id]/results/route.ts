import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';

export const dynamic = 'force-dynamic';

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => Boolean(item));
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        brand: true,
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                    question: true,
                    type: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            answers: true
          }
        },
        _count: {
          select: { responses: true }
        }
      }
    });

    if (!survey) {
      return NextResponse.json({ success: false, error: { message: 'Survey not found' } }, { status: 404 });
    }

    const totalSurveyResponses = survey._count.responses || 0;

    const results = survey.questions.map((q) => {
      const type = q.type ?? 'rating';
      const responseCount = q.answers.length;
      const answeredPct =
        totalSurveyResponses > 0 ? Number(((responseCount / totalSurveyResponses) * 100).toFixed(1)) : 0;
      if (type === 'rating') {
        const ratingValues = q.answers
          .map((answer) => answer.rating)
          .filter((value): value is number => typeof value === 'number');
        const totalRatings = ratingValues.reduce((acc, curr) => acc + curr, 0);
        const averageRating = ratingValues.length > 0 ? Number((totalRatings / ratingValues.length).toFixed(1)) : 0;
        const distribution = [1, 2, 3, 4, 5].map((rating) => {
          const count = ratingValues.filter((value) => value === rating).length;
          const percent = responseCount > 0 ? Number(((count / responseCount) * 100).toFixed(1)) : 0;
          return { rating, count, percent };
        });
        const ratingLabels = toStringArray(q.ratingLabels);
        return {
          id: q.id,
          question: q.question,
          type,
          sortOrder: q.sortOrder,
          isRequired: q.isRequired,
          responseCount,
          answeredPct,
          averageRating,
          ratingLabels,
          distribution,
          optionStats: null,
          yesNoStats: null,
          textSamples: null,
        };
      }

      if (type === 'yes_no') {
        const yes = q.answers.filter((answer) => answer.boolValue === true).length;
        const no = q.answers.filter((answer) => answer.boolValue === false).length;
        return {
          id: q.id,
          question: q.question,
          type,
          sortOrder: q.sortOrder,
          isRequired: q.isRequired,
          responseCount,
          answeredPct,
          averageRating: null,
          ratingLabels: null,
          distribution: null,
          optionStats: null,
          yesNoStats: {
            yes,
            no,
            yesPct: responseCount > 0 ? Number(((yes / responseCount) * 100).toFixed(1)) : 0,
            noPct: responseCount > 0 ? Number(((no / responseCount) * 100).toFixed(1)) : 0,
          },
          textSamples: null,
        };
      }

      if (type === 'single_choice' || type === 'multi_choice') {
        const configuredOptions = toStringArray(q.options);
        const counts = new Map<string, number>(configuredOptions.map((option) => [option, 0]));
        for (const answer of q.answers) {
          if (type === 'single_choice' && answer.optionValue) {
            counts.set(answer.optionValue, (counts.get(answer.optionValue) ?? 0) + 1);
          }
          if (type === 'multi_choice' && Array.isArray(answer.optionValues)) {
            for (const option of answer.optionValues as string[]) {
              counts.set(option, (counts.get(option) ?? 0) + 1);
            }
          }
        }
        const optionStats = Array.from(counts.entries())
          .map(([option, count]) => ({
            option,
            count,
            percent: responseCount > 0 ? Number(((count / responseCount) * 100).toFixed(1)) : 0,
          }))
          .sort((a, b) => b.count - a.count);
        return {
          id: q.id,
          question: q.question,
          type,
          sortOrder: q.sortOrder,
          isRequired: q.isRequired,
          responseCount,
          answeredPct,
          averageRating: null,
          ratingLabels: null,
          distribution: null,
          optionStats,
          yesNoStats: null,
          textSamples: null,
        };
      }

      const textEntries = q.answers
        .map((answer) => answer.textValue?.trim())
        .filter((value): value is string => Boolean(value));
      const textSamples = textEntries
        .slice(0, 8);

      return {
        id: q.id,
        question: q.question,
        type,
        sortOrder: q.sortOrder,
        isRequired: q.isRequired,
        responseCount,
        answeredPct,
        averageRating: null,
        ratingLabels: null,
        distribution: null,
        optionStats: null,
        yesNoStats: null,
        textSamples,
        textCount: textEntries.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        survey: {
          id: survey.id,
          name: survey.name,
          brand: survey.brand.name,
          isActive: survey.isActive,
          totalResponses: totalSurveyResponses
        },
        results,
        responses: survey.responses.map((response) => ({
          id: response.id,
          createdAt: response.createdAt,
          user: response.user
            ? {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email,
              }
            : null,
          answers: response.answers.map((answer) => ({
            questionId: answer.questionId,
            question: answer.question.question,
            type: answer.question.type,
            rating: answer.rating,
            boolValue: answer.boolValue,
            textValue: answer.textValue,
            optionValue: answer.optionValue,
            optionValues: Array.isArray(answer.optionValues) ? (answer.optionValues as string[]) : [],
          })),
        })),
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch survey results';
    console.error('Fetch survey results error:', error);
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
