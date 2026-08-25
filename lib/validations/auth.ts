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
 * Where to send someone after signing in.
 *
 * Only same-origin absolute paths are honoured. An attacker-supplied
 * `?next=https://evil.example` would otherwise turn the login page into an open
 * redirect.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
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
    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return null;
  }
}
