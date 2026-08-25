/**
 * Human copy for the failures that arrive as a `?error=` query param.
 *
 * `app/auth/callback/route.ts` and `app/auth/confirm/route.ts` cannot render
 * anything themselves — they are route handlers, so the only way they can
 * report a failure is to redirect and encode the reason in the URL. Without
 * this map the reason is dropped on the floor: someone clicking a confirmation
 * link that expired lands on a blank sign-in form with no explanation and no
 * way to get a new link.
 *
 * `recovery` is a separate offer from `resend`, because "send a new
 * confirmation link" needs an address we no longer have (the session died with
 * the link), whereas a password reset already has a form that asks for one.
 */

export type AuthErrorCode =
  | "invalid_link"
  | "expired_link"
  | "missing_code"
  | "exchange_failed"
  | "no_session";

export type AuthErrorCopy = {
  title: string;
  body: string;
  /** Where to send someone who wants to try again, if there is such a place. */
  action?: { label: string; href: string };
};

const MESSAGES: Record<AuthErrorCode, AuthErrorCopy> = {
  invalid_link: {
    title: "That link didn't look right",
    body: "It may have been cut in half by your email client. Try copying the whole address, or ask for a fresh one.",
    action: { label: "Send a new link", href: "/forgot-password" },
  },
  expired_link: {
    title: "That link has expired",
    body: "Confirmation and reset links are good for one hour, and only work once. Ask for a new one and it'll be waiting in your inbox.",
    action: { label: "Send a new link", href: "/forgot-password" },
  },
  missing_code: {
    title: "That sign-in didn't complete",
    body: "The provider sent you back without a code, which usually means the window was closed partway through. Give it another go.",
  },
  exchange_failed: {
    title: "We couldn't finish signing you in",
    body: "The link was valid but the session couldn't be created — often because it had already been used in another tab.",
  },
  no_session: {
    title: "We couldn't finish signing you in",
    body: "The sign-in completed but no session came back. Signing in again normally clears it.",
  },
};

/** Narrow an arbitrary query param to something we have copy for. */
export function authErrorCopy(code: string | null | undefined): AuthErrorCopy | null {
  if (!code) return null;
  return MESSAGES[code as AuthErrorCode] ?? null;
}
