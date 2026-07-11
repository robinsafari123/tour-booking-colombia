import { createClient as _createClient } from '@supabase/supabase-js';

// Use a placeholder URL during build time when env vars aren't set.
// Real values come from .env.local at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/** Browser-side Supabase client */
export function createBrowserClient() {
  return _createClient(supabaseUrl, supabaseAnonKey);
}

/** Server-side Supabase client (anon key + RLS) */
export function createServerClient() {
  return _createClient(supabaseUrl, supabaseAnonKey);
}

/** Admin Supabase client (service role key — bypasses RLS, server-only) */
export function createAdminClient() {
  return _createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Default singleton client — used by admin pages */
const supabase = _createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
