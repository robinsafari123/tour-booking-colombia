import supabase from '@/lib/supabase';

/**
 * Wraps fetch for admin API calls, automatically attaching the
 * current user's Supabase JWT in the Authorization header.
 */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
  });
}
