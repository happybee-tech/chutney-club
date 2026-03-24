import { NextResponse } from 'next/server';
import type { SurveyQuestionType } from '@prisma/client';
import { prisma } from '@/server/_shared/db/prisma';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set<SurveyQuestionType>([
  'rating',
  'yes_no',
  'short_text',
  'long_text',
  'single_choice',
  'multi_choice',
]);

type NormalizedQuestion = {
  question: string;
  type: SurveyQuestionType;
  options: string[];
  ratingLabels: string[];
  isRequired: boolean;
  sortOrder: number;
};

function normalizeQuestions(input: unknown[]) {
  return input
    .map((raw, index) => {
      const q = (raw ?? {}) as Record<string, unknown>;
      const question = typeof q.question === 'string' ? q.question.trim() : '';
      if (!question) return null;
      const rawType = typeof q.type === 'string' ? (q.type as SurveyQuestionType) : 'rating';
      const type: SurveyQuestionType = ALLOWED_TYPES.has(rawType) ? rawType : 'rating';
      const options =
        Array.isArray(q.options) && (type === 'single_choice' || type === 'multi_choice')
          ? q.options
              .map((opt) => (typeof opt === 'string' ? opt.trim() : ''))
              .filter((opt) => Boolean(opt))
          : [];
      const ratingLabels =
        Array.isArray(q.ratingLabels) && type === 'rating'
          ? q.ratingLabels
              .map((label) => (typeof label === 'string' ? label.trim() : ''))
              .slice(0, 5)
          : [];
      return {
        question,
        type,
        options,
        ratingLabels,
        isRequired: q.isRequired === false ? false : true,
        sortOrder: index,
      };
    })
    .filter((value): value is NormalizedQuestion => Boolean(value));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');

    let whereClause = {};
    if (brandId) {
      whereClause = { brandId };
    }

    const surveys = await prisma.survey.findMany({
      where: whereClause,
      include: {
        brand: true,
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: surveys });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch surveys';
    console.error('Fetch surveys error:', error);
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, linkTitle, brandId, startDate, endDate, isActive, questions } = body;

    if (!name || !linkTitle || !brandId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields' } }, { status: 400 });
    }

    const normalizedQuestions = normalizeQuestions(Array.isArray(questions) ? questions : []);
    const hasInvalidChoiceQuestion = normalizedQuestions.some(
      (q) => (q.type === 'single_choice' || q.type === 'multi_choice') && (!q.options || q.options.length < 2)
    );
    if (hasInvalidChoiceQuestion) {
      return NextResponse.json(
        { success: false, error: { message: 'Choice questions require at least 2 options' } },
        { status: 400 }
      );
    }

    const survey = await prisma.survey.create({
      data: {
        brandId,
        name,
        description,
        linkTitle,
        isActive: Boolean(isActive),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        questions: {
          create: normalizedQuestions,
        }
      }
    });

    return NextResponse.json({ success: true, data: survey });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create survey';
    console.error('Create survey error:', error);
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
