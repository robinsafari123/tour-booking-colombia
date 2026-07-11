import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = adminClient();
  const { data, error } = await supabase.from('page_content').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.admin.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  const supabase = adminClient();
  const body = await request.json();
  // body: { page, key, section, value_es, value_en }
  const { data, error } = await supabase
    .from('page_content')
    .upsert(body, { onConflict: 'page,key' })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Purge Next.js cache for all pages that display managed content
  const pathMap: Record<string, string[]> = {
    home:     ['/'],
    global:   ['/', '/tours', '/nosotros', '/reservar', '/contacto'],
    tours:    ['/tours'],
    nosotros: ['/nosotros'],
    reservar: ['/reservar'],
    contacto: ['/contacto'],
  };
  for (const path of pathMap[body.page as string] ?? []) revalidatePath(path);

  return NextResponse.json(data);
}
