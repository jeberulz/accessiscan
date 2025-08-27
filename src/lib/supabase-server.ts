import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  // Avoid throwing during import on client; API routes run on server
  console.warn('Supabase env vars not set. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

export function getSupabaseServer() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase environment variables are missing');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'accessiscan-next-server' } },
  });
}

