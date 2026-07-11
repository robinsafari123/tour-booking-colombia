import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { invalidateSettingsCache } from '@/lib/gateway-config';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// Keys that should be masked in GET responses
const SECRET_KEYS = new Set([
  'WOMPI_PRIVATE_KEY', 'WOMPI_INTEGRITY_KEY', 'WOMPI_EVENTS_KEY',
  'PAYU_API_KEY', 'PAYU_API_LOGIN',
  'MERCADOPAGO_ACCESS_TOKEN',
  'PAYPAL_CLIENT_SECRET',
  'RESEND_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]);

function mask(key: string, value: string): string {
  if (!SECRET_KEYS.has(key) || value.length <= 8) return value;
  return value.slice(0, 6) + '••••' + value.slice(-4);
}

// GET — return all saved settings (secrets masked)
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;

    const masked: Record<string, string> = {};
    for (const { key, value } of data ?? []) {
      masked[key] = mask(key, value);
    }

    return NextResponse.json(masked);
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Error loading settings' }, { status: 500 });
  }
}

// POST — upsert settings, skip empty values
export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.admin.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  try {
    const body: Record<string, string> = await request.json();
    const supabase = getSupabase();

    const rows = Object.entries(body)
      .filter(([, v]) => v && v.trim() !== '' && !v.includes('••••')) // skip empty + masked placeholders
      .map(([key, value]) => ({ key, value: value.trim(), updated_at: new Date().toISOString() }));

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, saved: 0 });
    }

    const { error } = await supabase
      .from('settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) throw error;

    invalidateSettingsCache();

    return NextResponse.json({ ok: true, saved: rows.length });
  } catch (err) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ error: 'Error saving settings' }, { status: 500 });
  }
}
