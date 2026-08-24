/**
 * The public origin of the app, without a trailing slash.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment, but preview
 * deployments should link to themselves, so VERCEL_URL wins when it is set and
 * we are not on production. NEXT_PUBLIC_SITE_URL overrides everything, which is
 * what a custom domain will use.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * The address on the contact page and in the legal pages' "how to reach us".
 *
 * One constant rather than a string repeated across three routes: it is the
 * thing most likely to change before launch, and a stale support address in a
 * privacy policy is worse than no address at all.
 */
export const CONTACT_EMAIL = "hello@owna.app";

/** The public URL of a profile, e.g. `https://owna.app/tamal`. */
export function profileUrl(username: string): string {
  return `${siteUrl()}/${username}`;
}

/** The same thing without a scheme, for display: `owna.app/tamal`. */
export function profileUrlLabel(username: string): string {
  return profileUrl(username).replace(/^https?:\/\//, "");
}
