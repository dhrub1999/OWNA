import { z } from "zod";

/**
 * Protocols a user-supplied link is allowed to use.
 *
 * The point of the allowlist is `javascript:` and `data:`, both of which
 * execute when a visitor clicks a link. Anything not named here is rejected.
 */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/** Protocols allowed for an image `src`. Narrower — no mailto, no tel. */
const ALLOWED_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

function parse(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare domains are the common case in a link field. Assume https rather than
  // rejecting "example.com", but never assume a protocol for something that
  // already declared one.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

/** Canonical form of a user-supplied link, or null if it is not usable. */
export function normalizeUrl(input: string): string | null {
  const url = parse(input);
  if (!url) return null;
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
  return url.toString();
}

export function isSafeUrl(input: string): boolean {
  return normalizeUrl(input) !== null;
}

/**
 * The render-time guard.
 *
 * Values are already validated on write, but rows written by an earlier version
 * of the schema outlive that validation, so every renderer passes hrefs through
 * here rather than trusting what is in the database. Returns undefined so the
 * caller can drop the attribute entirely instead of emitting a broken link.
 */
export function safeHref(input: string | null | undefined): string | undefined {
  if (!input) return undefined;
  return normalizeUrl(input) ?? undefined;
}

/** The same guard for image sources. */
export function safeImageSrc(
  input: string | null | undefined,
): string | undefined {
  if (!input) return undefined;
  const url = parse(input);
  if (!url || !ALLOWED_IMAGE_PROTOCOLS.has(url.protocol)) return undefined;
  return url.toString();
}

/** Zod schema for a link field: normalizes on the way in, rejects unsafe input. */
export const urlSchema = z
  .string()
  .trim()
  .min(1, "Enter a link")
  .max(2048, "That link is too long")
  .transform((value, ctx) => {
    const normalized = normalizeUrl(value);
    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: "That does not look like a valid link",
      });
      return z.NEVER;
    }
    return normalized;
  });

/** Optional link field: an empty string becomes undefined rather than an error. */
export const optionalUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined;
    const normalized = normalizeUrl(value);
    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: "That does not look like a valid link",
      });
      return z.NEVER;
    }
    return normalized;
  });
