/**
 * A recipient address the project's mail provider will actually accept.
 *
 * `@example.com` cannot be used here, which is not obvious and cost a lot of
 * time. Resend rejects known-placeholder domains outright:
 *
 *   550 "Invalid `to` field. Please use our testing email address instead of
 *        domains like `example.com`."
 *
 * Supabase fails `signup` and `updateUser()` atomically when the send fails, so
 * that 550 becomes a 500 with no user row written at all. The spec then dies at
 * the account gate showing "Error sending confirmation email", which reads like
 * a product regression but is only ever a rejected recipient.
 *
 * `delivered@resend.dev` is Resend's own sink: it always accepts, simulates a
 * successful delivery, reaches no real inbox and does not touch the account's
 * sending reputation. The plus tag keeps each run's address unique, because
 * Supabase refuses an address that already has an account.
 *
 * Set OWNA_E2E_EMAIL_DOMAIN when the target project sends through something
 * other than Resend, e.g. a local Inbucket:
 *
 *   OWNA_E2E_EMAIL_DOMAIN=inbucket.local OWNA_E2E=1 bun run test:e2e
 */
export function e2eEmail(tag: string): string {
  const domain = process.env.OWNA_E2E_EMAIL_DOMAIN ?? "resend.dev";

  // The sink only exists at the local part `delivered`; a plus tag keeps the
  // address unique per run without changing which mailbox it resolves to.
  const local = domain === "resend.dev" ? `delivered+${tag}` : tag;

  return `${local}@${domain}`;
}
