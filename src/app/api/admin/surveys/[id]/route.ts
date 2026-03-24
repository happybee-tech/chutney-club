import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';

const ALLOWED_TYPES = new Set([
  'rating',
  'yes_no',
  'short_text',
  'long_text',
  'single_choice',
  'multi_choice',
]);

function normalizeQuestions(input: unknown[]) {
  return input
    .map((raw, index) => {
      const q = (raw ?? {}) as Record<string, unknown>;
      const question = typeof q.question === 'string' ? q.question.trim() : '';
      if (!question) return null;
      const rawType = typeof q.type === 'string' ? q.type : 'rating';
      const type = ALLOWED_TYPES.has(rawType) ? rawType : 'rating';
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
        options: options.length ? options : null,
        ratingLabels: ratingLabels.length ? ratingLabels : null,
        isRequired: q.isRequired === false ? false : true,
        sortOrder: index,
      };
    })
    .filter((value): value is { question: string; type: string; options: string[] | null; ratingLabels: string[] | null; isRequired: boolean; sortOrder: number } => Boolean(value));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { ...body };

    // If updating questions, delete old ones and recreate
    if (updateData.questions) {
      await prisma.surveyQuestion.deleteMany({ where: { surveyId: id } });
      const normalizedQuestions = normalizeQuestions(
        Array.isArray(updateData.questions) ? (updateData.questions as unknown[]) : []
      );
      const hasInvalidChoiceQuestion = normalizedQuestions.some(
        (q) => (q.type === 'single_choice' || q.type === 'multi_choice') && (!q.options || q.options.length < 2)
      );
      if (hasInvalidChoiceQuestion) {
        return NextResponse.json(
          { success: false, error: { message: 'Choice questions require at least 2 options' } },
          { status: 400 }
        );
      }
      updateData.questions = {
        create: normalizedQuestions,
      };
    }

    if (typeof updateData.startDate === 'string') updateData.startDate = new Date(updateData.startDate);
    if (typeof updateData.endDate === 'string') updateData.endDate = new Date(updateData.endDate);

    // Some fields like id should not be updated
    delete updateData.id;
    delete updateData.brand;
    delete updateData._count;

    const prismaUpdateData = updateData as Parameters<typeof prisma.survey.update>[0]['data'];

    const survey = await prisma.survey.update({
      where: { id },
      data: prismaUpdateData,
    });

    return NextResponse.json({ success: true, data: survey });
  } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Failed to update survey';
     console.error('Update survey error:', error);
     return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.survey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete survey';
    console.error('Delete survey error:', error);
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        brand: true,
      }
    });

    return NextResponse.json({ success: true, data: survey });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch survey';
    console.error('Fetch survey error:', error);
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
