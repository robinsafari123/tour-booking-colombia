import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function proxy(request: NextRequest) {
  const token = request.headers.get('Authorization')?.slice(7) ?? null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // getUser() validates the JWT against the Supabase auth server (not just locally)
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.set('x-user-id', user.id);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Only runs on admin API routes — webhooks and public routes are unaffected
  matcher: ['/api/admin/:path*'],
};
