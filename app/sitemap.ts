import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getSitemapProfiles } from "@/lib/supabase/queries";

/**
 * Published, public profiles.
 *
 * Unlisted profiles are deliberately absent: reachable by link is not the same
 * as findable, and a sitemap entry would collapse that distinction.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const profiles = await getSitemapProfiles();

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...profiles.map((profile) => ({
      url: `${base}/${profile.username}`,
      lastModified: new Date(profile.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
