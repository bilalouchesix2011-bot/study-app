import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté navigateur (Next.js).
 * Utilise uniquement des variables NEXT_PUBLIC_*.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants dans .env.local"
    );
  }

  return createClient(url, anonKey);
}

