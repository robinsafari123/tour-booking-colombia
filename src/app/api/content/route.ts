import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page');
  if (!page) return NextResponse.json({});

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('page_content')
    .select('key, value_es, value_en')
    .eq('page', page);

  const content: Record<string, { es: string; en: string }> = {};
  for (const row of data || []) {
    content[row.key] = { es: row.value_es || '', en: row.value_en || '' };
  }

  return NextResponse.json(content, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
