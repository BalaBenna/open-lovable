import { createClient } from '@supabase/supabase-js';

export const supabaseBrowser = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    // Fail softly in browser context
    return null as any;
  }
  return createClient(url, anon, {
    auth: { persistSession: true },
    realtime: { params: { eventsPerSecond: 10 } },
  });
})();

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !service) throw new Error('Missing Supabase admin env vars');
  return createClient(url, service, { auth: { persistSession: false } });
}


