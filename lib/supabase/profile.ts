import "server-only";

import type { Tables } from "@/types/database";
import { createClient, getUser } from "./server";

export type BlockRow = Tables<"blocks">;
export type PageRow = Tables<"pages">;
export type ProfileRow = Tables<"profiles">;

/**
 * Draft reads for the signed-in owner.
 *
 * These are request-scoped and cookie-backed, so they can never be wrapped in
 * `use cache`. That is correct: a draft changes constantly and is read by
 * exactly one person.
 *
 * RLS means none of these queries need an explicit `user_id = ...` filter to be
 * safe. They include one anyway where it costs nothing, so the intent is
 * visible without cross-referencing the policies.
 */

export type Draft = {
  profile: ProfileRow;
  page: PageRow;
  blocks: BlockRow[];
};

export async function getOwnProfile(): Promise<ProfileRow | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ?? null;
}

/** The whole draft in two round trips. */
export async function getDraft(): Promise<Draft | null> {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_home", true)
    .maybeSingle();

  if (!page) return null;

  const { data: blocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", page.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return { profile, page, blocks: blocks ?? [] };
}

/** Whether this profile currently has a live public URL. */
export async function getPublicationState(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_publications")
    .select("is_live, version, published_at")
    .eq("profile_id", profileId)
    .maybeSingle();

  return {
    isLive: data?.is_live ?? false,
    version: data?.version ?? 0,
    publishedAt: data?.published_at ?? null,
    hasEverPublished: Boolean(data),
  };
}
