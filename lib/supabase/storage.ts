import type { FileOptions } from "@supabase/storage-js";
import { createBrowserSupabaseClient } from "./client";

export function getDefaultBucket() {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "uploads";
}

/**
 * Upload côté navigateur (requires règles Storage/RLS adaptées dans Supabase).
 * Pour un flux "sécurisé avec NextAuth", préfère des URLs signées via serveur.
 */
export async function uploadFileFromBrowser(params: {
  bucket?: string;
  path: string;
  file: File | Blob;
  options?: FileOptions;
}) {
  const supabase = createBrowserSupabaseClient();
  const bucket = params.bucket ?? getDefaultBucket();

  return supabase.storage.from(bucket).upload(params.path, params.file, {
    upsert: false,
    ...params.options,
  });
}

export function getPublicUrl(params: { bucket?: string; path: string }) {
  const supabase = createBrowserSupabaseClient();
  const bucket = params.bucket ?? getDefaultBucket();
  return supabase.storage.from(bucket).getPublicUrl(params.path);
}

