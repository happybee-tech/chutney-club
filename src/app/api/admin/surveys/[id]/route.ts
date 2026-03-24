import { NextResponse } from 'next/server';
import { prisma } from '@/server/_shared/db/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = { ...body };

    // If updating questions, delete old ones and recreate
    if (updateData.questions) {
      await prisma.surveyQuestion.deleteMany({ where: { surveyId: id } });
      updateData.questions = {
        create: updateData.questions.map((q: any, i: number) => ({
          question: q.question,
          sortOrder: i,
        }))
      };
    }

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    // Some fields like id should not be updated
    delete updateData.id;
    delete updateData.brand;
    delete updateData._count;

    const survey = await prisma.survey.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: survey });
  } catch (error: any) {
     console.error('Update survey error:', error);
     return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.survey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete survey error:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
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
  } catch (error: any) {
    console.error('Fetch survey error:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
