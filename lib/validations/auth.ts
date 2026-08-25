import { z } from "zod";

/**
 * Credential shapes.
 *
 * Every one of these is re-parsed inside the Server Action. The client copy is
 * for the inline error message; it is not a check the server relies on.
 */
export const emailSchema = z
  .email("Enter a valid email address")
  .trim()
  .toLowerCase()
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  // Supabase's own limit. Rejecting here gives a clear message rather than an
  // opaque API error.
  .max(72, "At most 72 characters");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

/**
 * A throwaway origin to resolve candidate paths against.
 *
 * `.invalid` is reserved by RFC 2606 and can never be a real host, so a value
 * that resolves to this origin provably did not name one of its own.
 */
const PROBE_ORIGIN = "https://next-path.invalid";

/**
 * Where to send someone after signing in.
 *
 * Only same-origin absolute paths are honoured. An attacker-supplied
 * `?next=https://evil.example` would otherwise turn the login page into an open
 * redirect.
 *
 * The check runs the value through the URL parser rather than matching on the
 * string, because the parser is what the browser applies to a `Location`
 * header and it disagrees with the obvious string checks in three ways that
 * all produce off-site redirects:
 *
 *   * a backslash is a second slash, so `/\evil.example` is an absolute URL on
 *     evil.example while still passing `startsWith("/")`;
 *   * tab, LF and CR are stripped wherever they appear, so `/<TAB>\evil.example`
 *     defeats any check that looks only at the leading characters;
 *   * `..` segments are resolved, so `/..//evil.example` normalizes to a
 *     protocol-relative `//evil.example`.
 *
 * Returning the parsed path rather than the raw input is part of the guard: the
 * caller redirects to a value the parser has already agreed is same-origin.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;

  let url: URL;
  try {
    url = new URL(value, PROBE_ORIGIN);
  } catch {
    return null;
  }

  if (url.origin !== PROBE_ORIGIN) return null;

  const path = `${url.pathname}${url.search}${url.hash}`;
  // Normalization can still leave a protocol-relative path behind, which the
  // next parser to see it — the browser's — would read as a host.
  if (path.startsWith("//")) return null;

  return path;
}

/**
 * `safeNextPath`, but it also accepts an absolute URL on our own origin.
 *
 * Email links need this. Supabase interpolates `{{ .RedirectTo }}` as the whole
 * URL we handed to `emailRedirectTo`, not as a path, so a confirmation link
 * arrives carrying `next=https://owna.app/dashboard`. `safeNextPath` rejects
 * that — correctly, since it cannot tell our origin from an attacker's — and
 * the visitor silently lands on the default instead of where they were going.
 *
 * Anything off-origin is still refused, so this stays closed to open redirects.
 * The extracted path goes back through `safeNextPath` rather than being
 * returned directly, so both entry points share one guard.
 */
export function safeNextTarget(
  value: string | null | undefined,
  origin: string,
): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return safeNextPath(value);

  try {
    const url = new URL(value);
    if (url.origin !== origin) return null;
    // `pathname` is never empty for an http(s) URL — a bare origin parses with
    // "/" — so there is no empty case to paper over here, and a null from
    // `safeNextPath` is a rejection that must stay a rejection.
    return safeNextPath(`${url.pathname}${url.search}${url.hash}`);
  } catch {
    return null;
  }
}
