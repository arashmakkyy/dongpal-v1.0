import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readConfig(): { url: string; key: string } {
  const url =
    import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return { url, key };
}

let cached: SupabaseClient | null | undefined;

/**
 * Shared Supabase client, or `null` when the project is not configured.
 *
 * Never throws: sync treats `null` as local-only ("off") instead of crashing
 * the whole app on import (the previous module threw at load when env was
 * missing, blank-screening every route).
 */
export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const { url, key } = readConfig();
  if (!url || !key) {
    cached = null;
    return cached;
  }
  cached = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
