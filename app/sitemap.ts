import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getSitemapProfileCount, getSitemapProfiles } from "@/lib/supabase/queries";

const PERSONAS = ["consultant", "photographer", "freelancer", "creative", "jewellery"];

/**
 * Published, public profiles.
 *
 * Unlisted profiles are deliberately absent: reachable by link is not the same
 * as findable, and a sitemap entry would collapse that distinction.
 *
 * Sharded rather than a single list: a flat query with a hardcoded limit
 * silently drops every profile past that limit once the count exceeds it,
 * with no error anywhere. generateSitemaps() below sizes the shard count from
 * the real row count instead, so growth just adds another shard file.
 */
const PAGE_SIZE = 40000; // headroom under Next's 50k-URLs-per-file cap

export async function generateSitemaps() {
  const count = await getSitemapProfileCount();
  const shards = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return Array.from({ length: shards }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const profiles = await getSitemapProfiles(id * PAGE_SIZE, PAGE_SIZE);

  // Static routes only belong on the first shard — repeating them on every
  // shard would duplicate them in the index.
  const staticEntries: MetadataRoute.Sitemap =
    id === 0
      ? [
          {
            url: base,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
          },
          ...["/privacy", "/terms", "/contact", "/pricing"].map((path) => ({
            url: `${base}${path}`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.3,
          })),
          {
            url: `${base}/for`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
          },
          ...PERSONAS.map((persona) => ({
            url: `${base}/for/${persona}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
          })),
          {
            url: `${base}/discover`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.6,
          },
          ...PERSONAS.map((persona) => ({
            url: `${base}/discover/${persona}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.5,
          })),
          // Only page 1 of each /discover listing belongs in the sitemap —
          // deeper pages are reachable through on-page pagination, not worth
          // enumerating here.
        ]
      : [];

  return [
    ...staticEntries,
    ...profiles.map((profile) => ({
      url: `${base}/${profile.username}`,
      lastModified: new Date(profile.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
