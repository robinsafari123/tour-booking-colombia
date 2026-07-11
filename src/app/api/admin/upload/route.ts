import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.admin.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from('media')
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json(
      { error: `Upload failed: ${error.message}. Make sure the "media" bucket exists and is public in your Supabase Storage settings.` },
      { status: 500 }
    );
  }

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename);
  return NextResponse.json({ url: publicUrl });
}
