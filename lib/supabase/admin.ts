import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase "admin" côté serveur.
 * Utile si tu gardes NextAuth mais veux :
 * - créer des URLs signées Storage
 * - effectuer des opérations Storage sans exposer la clé au navigateur
 *
 * Requiert: SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */
export function createServerSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Supabase: NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local");
  }
  if (!serviceRoleKey) {
    throw new Error("Supabase: SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

