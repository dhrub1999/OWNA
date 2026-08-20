import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Anonymous, cookie-less client for reading published profiles.
 *
 * This is the only client that may be used inside a `use cache` scope: it never
 * touches cookies() or headers(), so a cached public profile page has no
 * request-specific input and can be prerendered into the static shell.
 *
 * It carries no session, so RLS evaluates every read as `anon` — which means it
 * can reach exactly one thing, the live rows of profile_publications.
 */
let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createPublicClient() {
  cached ??= createSupabaseClient<Database>(
    SUPABASE_URL(),
    SUPABASE_PUBLISHABLE_KEY(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return cached;
}
