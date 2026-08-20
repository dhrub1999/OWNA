import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { snapshotSeo } from "@/lib/blocks/snapshot";
import { getPublishedProfile } from "@/lib/supabase/queries";
import { profileUrl } from "@/lib/site";

/**
 * The public profile.
 *
 * One application, one renderer, many profiles: the username in the path picks
 * which snapshot to render. Nothing is deployed per user, and publishing an
 * edit takes effect through cache invalidation rather than a rebuild.
 *
 * `generateMetadata` and the page body both call getPublishedProfile, which is
 * a `use cache` function — the second call is served from the cache rather than
 * hitting the database twice.
 */

/**
 * No static shell is possible here, and pretending otherwise would only add a
 * Suspense boundary around the entire page.
 *
 * Every pixel of a profile depends on which username was requested, and the set
 * of usernames is unbounded and grows at signup, so there is nothing to
 * prerender at build time and no `generateStaticParams` worth writing. What
 * makes the page fast is `getPublishedProfile`: a `use cache` read tagged with
 * the username and invalidated on publish, so a request costs one cache hit and
 * a pure render with no database round trip.
 */
export const instant = false;
export async function generateMetadata({
  params,
}: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const snapshot = await getPublishedProfile(username);

  if (!snapshot) {
    return { title: "Profile not found", robots: { index: false } };
  }

  const { title, description } = snapshotSeo(snapshot);
  const url = profileUrl(snapshot.profile.username);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile", siteName: "OWNA" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProfilePage({ params }: PageProps<"/[username]">) {
  const { username } = await params;
  const snapshot = await getPublishedProfile(username);

  if (!snapshot) notFound();

  return <ProfileRenderer snapshot={snapshot} />;
}
