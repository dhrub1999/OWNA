import { z } from "zod";

/**
 * Must stay identical to `private.is_valid_username` in
 * supabase/migrations/*_init_schema.sql. The database is authoritative; this
 * copy exists so the signup form can reject a bad name without a round trip.
 *
 * 3–30 characters, starts and ends alphanumeric, lowercase only. Lowercase is
 * enforced by the character class rather than by normalizing afterwards, so
 * there is no casing under which the unique index can be defeated.
 */
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])?$/;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(USERNAME_MIN_LENGTH, `At least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `At most ${USERNAME_MAX_LENGTH} characters`)
  .regex(
    USERNAME_PATTERN,
    "Letters, numbers, dashes and underscores. Must start and end with a letter or number.",
  );

/**
 * What to show under the input as the user types, before the availability
 * round trip resolves. Returns null when the value is syntactically fine.
 */
export function usernameFormatError(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value.length < USERNAME_MIN_LENGTH)
    return `At least ${USERNAME_MIN_LENGTH} characters`;
  if (value.length > USERNAME_MAX_LENGTH)
    return `At most ${USERNAME_MAX_LENGTH} characters`;
  if (!/^[a-z0-9_-]+$/.test(value))
    return "Only letters, numbers, dashes and underscores";
  if (!USERNAME_PATTERN.test(value))
    return "Must start and end with a letter or number";
  return null;
}

/** Strip anything a username cannot contain, for use as you type. */
export function sanitizeUsernameInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
}

/** Turn an email or display name into a plausible first suggestion. */
export function suggestUsername(seed: string): string {
  const base = sanitizeUsernameInput(seed.split("@")[0] ?? "").replace(
    /^[_-]+|[_-]+$/g,
    "",
  );
  if (base.length >= USERNAME_MIN_LENGTH) return base;
  return `${base}${Math.random().toString(36).slice(2, 6)}`.slice(
    0,
    USERNAME_MAX_LENGTH,
  );
}
