import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { success, limit, reset } = await rateLimiters.admin.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  const { id } = await ctx.params;
  const supabase = adminClient();
  const body = await request.json();
  const { error } = await supabase.from('tours').update(body).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { success, limit, reset } = await rateLimiters.admin.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  const { id } = await ctx.params;
  const supabase = adminClient();
  const { error } = await supabase.from('tours').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
