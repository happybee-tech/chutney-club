import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        brand: true,
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

    // Process averages
    const results = survey.questions.map(q => {
      const totalRatings = q.answers.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = q.answers.length > 0 ? (totalRatings / q.answers.length).toFixed(1) : 0;
      
      return {
        id: q.id,
        question: q.question,
        sortOrder: q.sortOrder,
        responseCount: q.answers.length,
        averageRating: Number(averageRating)
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
          totalResponses: survey._count.responses
        },
        results
      }
    });
  } catch (error: any) {
    console.error('Fetch survey results error:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
