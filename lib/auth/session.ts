/**
 * Pure predicates over a Supabase user.
 *
 * Deliberately outside `lib/supabase/server.ts`: that module is `server-only`,
 * which is right for anything holding a cookie-backed client but wrong for two
 * functions that just read fields off an object. Locking them behind it made
 * them untestable and unusable from a client component, neither of which is a
 * property of the logic itself.
 */

/**
 * True for a visitor who still needs the publish-time account gate.
 *
 * Not just `is_anonymous`: once `upgradeAnonymousAccount` has attached an
 * email to the session, the visitor shouldn't be asked to create an account
 * again just because email confirmation is still pending — `is_anonymous`
 * only flips once that confirmation link is clicked.
 *
 * Checked against `new_email`, not `email`: `supabase.auth.updateUser({email})`
 * on an anonymous session parks the address in `new_email` (backed by
 * `auth.users.email_change`) until it's confirmed. `email` itself stays empty
 * the whole time — confirmed live against the actual API response, not
 * assumed. Reading only `email` here is what let a second Publish reopen this
 * same gate right after the first one had just been completed.
 */
export function isGuestSession(
  user: { is_anonymous?: boolean; email?: string; new_email?: string } | null,
) {
  return Boolean(user?.is_anonymous) && !user?.email && !user?.new_email;
}

/**
 * True while Supabase is still waiting on a confirmation click for an address
 * the user has already given us.
 *
 * The complement of `isGuestSession` over the same middle state, and it lives
 * next to it deliberately: an upgraded-but-unconfirmed visitor must be past the
 * publish gate *and* still nagged about their inbox. Writing the two conditions
 * separately at each call site is how they drift into contradicting each other.
 *
 * `email || new_email`, same reasoning as `isGuestSession`: the pending
 * address from an anonymous upgrade lives in `new_email` until confirmed, so
 * checking `email` alone would never flag it.
 */
export function needsEmailConfirmation(
  user: { email?: string; new_email?: string; email_confirmed_at?: string } | null,
) {
  return Boolean(user?.email || user?.new_email) && !user?.email_confirmed_at;
}
