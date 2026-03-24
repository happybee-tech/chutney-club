import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/server/_shared/utils/adminAuth';
import { getSupabaseServiceClient } from '@/server/_shared/auth/supabase';

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extFromName(name: string) {
  const parts = name.split('.');
  if (parts.length < 2) return 'jpg';
  return parts[parts.length - 1].toLowerCase();
}

export async function POST(request: Request) {
  const denied = await requireAdminAccess(request);
  if (denied) return denied;

  const form = await request.formData();
  const brandId = String(form.get('brand_id') ?? '').trim();
  const files = form.getAll('files').filter((file): file is File => file instanceof File);

  if (!brandId) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'brand_id is required' } },
      { status: 400 }
    );
  }

  if (!files.length) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'at least one file is required' } },
      { status: 400 }
    );
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'brand-assets-public';
  const supabase = getSupabaseServiceClient();
  const uploaded: Array<{ path: string; url: string; name: string; size: number }> = [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'only image files are allowed' } },
        { status: 400 }
      );
    }

    const original = sanitizeFileName(file.name || 'image');
    const ext = extFromName(original);
    const base = original.replace(new RegExp(`\\.${ext}$`), '') || 'image';
    const fileName = `${base}-${crypto.randomUUID()}.${ext}`;
    const path = `products/${brandId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_FAILED', message: uploadError.message } },
        { status: 400 }
      );
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    uploaded.push({
      path,
      url: data.publicUrl,
      name: file.name,
      size: file.size,
    });
  }

  return NextResponse.json({ success: true, data: { bucket, uploaded } });
}
