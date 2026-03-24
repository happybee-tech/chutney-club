import { NextResponse } from 'next/server';
import { listDeliverySlots } from '@/server/delivery/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as 'perishable' | 'non_perishable' | 'both' | null;
  const date = searchParams.get('date') ?? undefined;

  const slots = await listDeliverySlots({
    category: category ?? undefined,
    date,
  });

  return NextResponse.json({ success: true, data: slots });
}
