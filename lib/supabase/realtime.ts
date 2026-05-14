import { createBrowserSupabaseClient } from "./client";

/**
 * Subscribe à des changements Postgres (Realtime).
 *
 * IMPORTANT:
 * - Il faut activer Realtime sur la table dans Supabase.
 * - Les événements reçus dépendent des règles RLS/politiques.
 */
export function subscribeToTable(params: {
  schema?: string;
  table: string;
  filter?: string; // ex: "id=eq.123"
  onChange: (payload: unknown) => void;
}) {
  const supabase = createBrowserSupabaseClient();
  const schema = params.schema ?? "public";

  const channel = supabase
    .channel(`db:${schema}:${params.table}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema,
        table: params.table,
        filter: params.filter,
      },
      (payload) => params.onChange(payload)
    )
    .subscribe();

  return {
    channel,
    unsubscribe: async () => {
      await supabase.removeChannel(channel);
    },
  };
}

