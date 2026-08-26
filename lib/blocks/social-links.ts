import { safeHref } from "@/lib/validations/url";
import type { SocialPlatform } from "./definitions";

/**
 * Resolve a social block's stored platform+value into a safe href.
 *
 * An email platform value is turned into a mailto: here rather than being
 * stored that way, so the user types an address and gets a working link.
 *
 * Shared by the social block renderer and lib/seo/structured-data.ts so a
 * link's validity (and the mailto: rewrite) is decided in exactly one place.
 */
export function resolveSocialHref(
  platform: SocialPlatform,
  raw: string,
): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (platform === "email") {
    return value.includes("@") && !value.startsWith("mailto:")
      ? safeHref(`mailto:${value}`)
      : safeHref(value);
  }
  return safeHref(value);
}
