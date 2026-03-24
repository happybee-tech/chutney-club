import { NextResponse } from 'next/server';
import { listBrands } from '@/server/catalog/service';

export async function GET() {
  const brands = await listBrands();
  return NextResponse.json({ success: true, data: brands });
}
