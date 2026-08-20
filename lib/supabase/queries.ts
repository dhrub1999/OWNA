import "server-only";

import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { type ProfileSnapshot, parseSnapshot } from "@/lib/blocks/snapshot";
import { createPublicClient } from "./public";

/**
 * Reads for the public site.
 *
 * `getPublishedProfile` is the hot path of the whole product: it is what runs
 * when a stranger opens owna.com/someone. It reads exactly one indexed row and
 * caches it indefinitely under a per-username tag, so a profile is served from
 * the static shell until its owner republishes and the tag is invalidated.
 *
 * Nothing in this call stack may touch cookies() or headers() — that is a hard
 * requirement of `use cache`, and the reason createPublicClient exists.
 */

/** The cache tag for one profile. Publishing invalidates exactly this. */
export function profileTag(username: string): string {
  return `profile:${username.trim().toLowerCase()}`;
}

export async function getPublishedProfile(
  username: string,
): Promise<ProfileSnapshot | null> {
  "use cache";

  const handle = username.trim().toLowerCase();
  cacheTag(profileTag(handle));
  // A published profile only changes when its owner republishes, which fires
  // revalidateTag. Time-based expiry would just add needless refetches.
  cacheLife("max");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("profile_publications")
    .select("snapshot, visibility")
    .eq("username", handle)
    .eq("is_live", true)
    .maybeSingle();

  // RLS already hides private and unpublished rows from `anon`; the filters
  // above are belt-and-braces so the intent is readable at the call site.
  if (error || !data) return null;
  if (data.visibility === "private") return null;

  return parseSnapshot(data.snapshot);
}

/**
 * Invalidate a profile's public page.
 *
 * 'max' gives the longest stale-while-revalidate window, so visitors keep
 * getting an instant response while the new version is generated behind them.
 * A username change has to invalidate both handles — see rename_username in the
 * migrations, which keeps the denormalized column in step on the database side.
 */
export function revalidateProfile(...usernames: (string | null | undefined)[]) {
  for (const username of usernames) {
    if (username) revalidateTag(profileTag(username), "max");
  }
}

/** Usernames to include in the sitemap: live, public, not unlisted. */
export async function getSitemapProfiles(): Promise<
  { username: string; publishedAt: string }[]
> {
  "use cache";
  cacheTag("sitemap");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("profile_publications")
    .select("username, published_at")
    .eq("is_live", true)
    .eq("visibility", "public")
    .order("published_at", { ascending: false })
    .limit(10000);

  if (error || !data) return [];

  return data.map((row) => ({
    username: row.username,
    publishedAt: row.published_at,
  }));
}
