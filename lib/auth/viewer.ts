import "server-only";

import { getOwnProfile } from "@/lib/supabase/profile";
import { getUser, isGuestSession } from "@/lib/supabase/server";

/**
 * Who is looking at a public page, in the terms the chrome actually needs.
 *
 * `is_anonymous` alone is the wrong question everywhere outside the publish
 * gate. Almost every visitor has *some* session, because the landing page's
 * CTA calls `signInAnonymously()` before it even navigates — so branching on
 * "is there a user" would offer a Dashboard link to someone who has never
 * answered a single question. What separates the three states is whether a
 * profile has been claimed, and whether the session behind it is still a guest.
 *
 * - `signed-out`  — no session, or a session with nothing built under it yet.
 *                   Identical treatment either way: the CTA reuses the existing
 *                   anonymous session, and the questionnaire restores any saved
 *                   answers, so a half-finished visitor resumes without needing
 *                   a fourth state.
 * - `guest-draft` — a claimed handle owned by an anonymous session. Signing
 *                   into another account here would strand it, which is why the
 *                   sign-in page warns rather than silently switching.
 * - `member`      — a real account, confirmed or not.
 */
export type Viewer =
  | { state: "signed-out" }
  | { state: "guest-draft"; username: string }
  | { state: "member"; username: string | null };

export async function getViewer(): Promise<Viewer> {
  const user = await getUser();
  if (!user) return { state: "signed-out" };

  const profile = await getOwnProfile();
  if (!profile) return { state: "signed-out" };

  return isGuestSession(user)
    ? { state: "guest-draft", username: profile.username }
    : { state: "member", username: profile.username };
}
