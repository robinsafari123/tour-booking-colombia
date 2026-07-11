import { NextRequest, NextResponse } from 'next/server';
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
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.admin.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  const supabase = adminClient();
  const raw = await request.json();
  if (Array.isArray(raw)) {
    const { data, error } = await supabase.from('tours').insert(raw).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }
  const { data, error } = await supabase.from('tours').insert(raw).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
