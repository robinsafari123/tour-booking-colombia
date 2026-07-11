import { createClient } from '@supabase/supabase-js';

// Simple in-memory cache so payment routes don't hit the DB on every request
let cachedSettings: Record<string, string> = {};
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute
let cachePopulated = false;

async function loadSettings(): Promise<Record<string, string>> {
  if (cachePopulated && Date.now() - cacheTime < CACHE_TTL) return cachedSettings;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return {};

    const supabase = createClient(url, key);
    const { data } = await supabase.from('settings').select('key, value');
    cachedSettings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    cacheTime = Date.now();
    cachePopulated = true;
    return cachedSettings;
  } catch {
    return {};
  }
}

/** Invalidate cache — call after saving new settings */
export function invalidateSettingsCache() {
  cachedSettings = {};
  cacheTime = 0;
  cachePopulated = false;
}

/**
 * Get a config value: DB settings take priority over env vars.
 * This lets admins override env vars from the admin panel.
 */
export async function getConfig(key: string): Promise<string> {
  const settings = await loadSettings();
  return settings[key] || process.env[key] || '';
}
