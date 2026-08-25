import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "@/types/database";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Cookie-backed server client, for Server Components, Server Actions and Route
 * Handlers that act as the signed-in user.
 *
 * Because it reads cookies it can never be called from inside a `use cache`
 * scope — Next.js rejects runtime APIs anywhere in a cached call stack. Cached
 * public reads use `lib/supabase/public.ts` instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL(),
    SUPABASE_PUBLISHABLE_KEY(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // proxy.ts refreshes the session, so ignoring this is safe.
          }
        },
      },
    },
  );
}

/**
 * The signed-in user, or null. Always uses getUser(), which revalidates the
 * token with Supabase — getSession() only decodes the cookie and will happily
 * return a forged one.
 *
 * Wrapped in React's cache() so the several places in a single request that
 * each want to know "who is this" (a layout, a page, a Server Action) share
 * one token revalidation instead of one each.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The signed-in user, or throw. For Server Actions that must not run anonymously. */
export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

// Re-exported so the many existing `from "@/lib/supabase/server"` imports keep
// working. The definitions live in lib/auth/session.ts, which is not
// server-only, because they are pure functions over a plain object.
export { isGuestSession, needsEmailConfirmation } from "@/lib/auth/session";
