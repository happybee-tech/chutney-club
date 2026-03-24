import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';

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
  } catch (error: any) {
    console.error('Fetch surveys error:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, linkTitle, brandId, startDate, endDate, isActive, questions } = body;

    if (!name || !linkTitle || !brandId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields' } }, { status: 400 });
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
          create: (questions || []).map((q: any, i: number) => ({
            question: q.question,
            sortOrder: i,
          }))
        }
      }
    });

    return NextResponse.json({ success: true, data: survey });
  } catch (error: any) {
    console.error('Create survey error:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
