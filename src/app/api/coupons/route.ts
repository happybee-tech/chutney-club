import { NextResponse } from 'next/server';
import { listActiveCoupons } from '@/server/pricing/coupons';

export async function GET() {
  const data = await listActiveCoupons();
  return NextResponse.json({ success: true, data });
}

