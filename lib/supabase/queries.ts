import "server-only";

import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { type ProfileSnapshot, parseSnapshot } from "@/lib/blocks/snapshot";
import type { DemoProfileId } from "@/lib/demo-profiles";
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

/** How many live, public profiles exist — drives sitemap sharding. */
export async function getSitemapProfileCount(): Promise<number> {
  "use cache";
  cacheTag("sitemap");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { count } = await supabase
    .from("profile_publications")
    .select("username", { count: "exact", head: true })
    .eq("is_live", true)
    .eq("visibility", "public");

  return count ?? 0;
}

/**
 * A page of usernames to include in the sitemap: live, public, not unlisted.
 *
 * Offset-paginated rather than a single unbounded query — see
 * app/sitemap.ts's generateSitemaps(), which shards on this so the sitemap
 * keeps growing instead of silently truncating past one page size.
 */
export async function getSitemapProfiles(
  offset: number,
  limit: number,
): Promise<{ username: string; publishedAt: string }[]> {
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
    .range(offset, offset + limit - 1);

  if (error || !data) return [];

  return data.map((row) => ({
    username: row.username,
    publishedAt: row.published_at,
  }));
}

/**
 * The public directory (/discover).
 *
 * A profile appears here only once it satisfies every one of: live, public,
 * the owner opted in, AND an admin approved it (`directory_status =
 * 'approved'`, writable only through set_directory_status() — see the
 * directory migration). No completeness heuristic substitutes for that last
 * check: nothing in this schema distinguishes today's internal test profiles
 * from a future real one, so the gate has to be positive and manual, not a
 * filter trying to exclude the bad ones.
 */
export async function getDirectoryProfileCount(
  persona?: DemoProfileId,
): Promise<number> {
  "use cache";
  cacheTag("directory");
  cacheLife("hours");

  const supabase = createPublicClient();
  let query = supabase
    .from("profile_publications")
    .select("username", { count: "exact", head: true })
    .eq("is_live", true)
    .eq("visibility", "public")
    .eq("directory_opt_in", true)
    .eq("directory_status", "approved");

  if (persona) query = query.eq("directory_persona", persona);

  const { count } = await query;
  return count ?? 0;
}

export type DirectoryEntry = {
  username: string;
  snapshot: ProfileSnapshot;
  publishedAt: string;
};

export async function getDirectoryProfiles({
  persona,
  offset,
  limit,
}: {
  persona?: DemoProfileId;
  offset: number;
  limit: number;
}): Promise<DirectoryEntry[]> {
  "use cache";
  cacheTag("directory");
  cacheLife("hours");

  const supabase = createPublicClient();
  let query = supabase
    .from("profile_publications")
    .select("username, snapshot, published_at")
    .eq("is_live", true)
    .eq("visibility", "public")
    .eq("directory_opt_in", true)
    .eq("directory_status", "approved")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (persona) query = query.eq("directory_persona", persona);

  const { data, error } = await query;
  if (error || !data) return [];

  const entries: DirectoryEntry[] = [];
  for (const row of data) {
    const snapshot = parseSnapshot(row.snapshot);
    // A row whose snapshot no longer parses is dropped rather than crashing
    // the whole listing, the same trade-off getPublishedProfile makes.
    if (snapshot) {
      entries.push({ username: row.username, snapshot, publishedAt: row.published_at });
    }
  }
  return entries;
}
