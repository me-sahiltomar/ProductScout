import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const DEFAULT_SUPABASE_URL = 'https://gzhiltwyuhclzbhaypzd.supabase.co';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

export const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_KEY) &&
    !SUPABASE_KEY.startsWith('your-') &&
    SUPABASE_KEY.length > 20
  );
}

let serverClientInstance: SupabaseClient<Database> | null = null;

/**
 * Returns a server-side Supabase client with elevated / service privileges
 * for use in Next.js Server Components, Server Actions, and API Route Handlers.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!serverClientInstance) {
    serverClientInstance = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serverClientInstance;
}

/**
 * Returns a client-side Supabase client using anon key.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    '';

  if (!SUPABASE_URL || !anonKey || anonKey.startsWith('your-')) {
    return null;
  }

  return createClient<Database>(SUPABASE_URL, anonKey);
}
