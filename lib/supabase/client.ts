"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Browser client. Used by the auth forms, the editor's autosave, and direct
 * uploads to Storage. `createBrowserClient` memoizes internally, so calling
 * this repeatedly does not create extra connections.
 */
export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL(),
    SUPABASE_PUBLISHABLE_KEY(),
  );
}
