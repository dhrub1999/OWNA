"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Corrects a header that rendered "signed-out" only because the access-token
 * cookie had expired, not because the visitor actually logged out.
 *
 * `proxy.ts` refreshes the session on the signed-in surfaces
 * (`/dashboard`, `/editor`, ...) but deliberately skips `/` to keep the
 * landing page's shell cacheable — see `header-auth-slot.tsx`. That leaves a
 * real gap: a returning visitor whose access token expired between visits
 * sees "Log in" here even though their refresh-token cookie is still good.
 *
 * The browser Supabase client refreshes independently of the server and
 * writes the same cookies the server reads (`@supabase/ssr` shares cookie
 * storage between the two), so once it confirms a session exists,
 * `router.refresh()` re-runs `HeaderAuthSlot` against the now-valid cookie.
 */
export function HeaderAuthRefresh({ signedOut }: { signedOut: boolean }) {
  const router = useRouter();
  const attempted = useRef(false);

  useEffect(() => {
    if (!signedOut || attempted.current) return;
    attempted.current = true;

    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user) router.refresh();
      });
  }, [signedOut, router]);

  return null;
}
