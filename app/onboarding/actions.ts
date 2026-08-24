"use server";

import { redirect } from "next/navigation";
import { starterBlockProps } from "@/lib/blocks/definitions";
import { createClient, requireUser } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/validations/username";
import type { Tables } from "@/types/database";

/**
 * Claiming a username is the moment an account becomes a profile.
 *
 * The database does the work in one transaction (`public.claim_username`), so
 * a profile can never exist without its home page. This action's job is to
 * validate, translate the failure modes into something a person can read, and
 * seed enough content that the editor opens on a page rather than a blank rect.
 */

export type ClaimResult = { error: string };

/**
 * Call `claim_username` and translate its failure modes into copy a person can
 * read. Shared with `app/onboarding/questionnaire/actions.ts`, which claims a
 * name as one step of a bigger form instead of the whole submission.
 */
export async function claimUsernameRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string,
): Promise<{ profile: Tables<"profiles"> } | { error: string }> {
  // The function returns a composite, not a set, so there is no .single() here.
  const { data: profile, error } = await supabase.rpc("claim_username", {
    p_username: username,
  });

  if (error || !profile) {
    // 23505 is the unique index firing. The availability check the form ran a
    // moment ago is advisory — the index is what actually decides, and losing
    // that race is a normal outcome, not an exception.
    const taken =
      error?.code === "23505" || error?.message?.includes("not available");
    return {
      error: taken
        ? "Someone just took that one. Try another."
        : "Couldn't claim that name. Try again.",
    };
  }

  return { profile };
}

export async function claimUsername(formData: FormData): Promise<ClaimResult> {
  const user = await requireUser();

  const parsed = usernameSchema.safeParse(formData.get("username"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pick another name" };
  }

  const supabase = await createClient();
  const result = await claimUsernameRpc(supabase, parsed.data);
  if ("error" in result) return result;

  await seedProfile(result.profile.id, user.user_metadata ?? {});

  redirect("/editor");
}

/**
 * Give the new profile a starting point.
 *
 * Google hands us a name and a picture; using them means a first-time user sees
 * themselves on the canvas immediately instead of placeholder text. The hero
 * block itself is left with empty fields on purpose — blank hero fields fall
 * back to the profile, so editing your display name in settings keeps working
 * until you deliberately override it in the block.
 */
async function seedProfile(
  profileId: string,
  metadata: Record<string, unknown>,
) {
  const supabase = await createClient();

  const displayName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;

  const avatarUrl =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
        ? metadata.picture
        : null;

  if (displayName || avatarUrl) {
    await supabase
      .from("profiles")
      .update({
        ...(displayName ? { display_name: displayName } : {}),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      .eq("id", profileId);
  }

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("profile_id", profileId)
    .eq("is_home", true)
    .maybeSingle();

  if (!page) return;

  await supabase.from("blocks").insert([
    { page_id: page.id, type: "hero", position: 0, props: starterBlockProps("hero") },
    { page_id: page.id, type: "social", position: 1, props: starterBlockProps("social") },
  ]);
}
