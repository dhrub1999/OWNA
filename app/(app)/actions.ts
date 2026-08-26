"use server";

import { revalidateTag } from "next/cache";
import { parseEditorDocument } from "@/lib/editor/document";
import { sweepUnusedAssets } from "./asset-actions";
import { createClient, requireUser } from "@/lib/supabase/server";
import { revalidateProfile } from "@/lib/supabase/queries";
import { usernameSchema } from "@/lib/validations/username";

/**
 * Mutations for the signed-in owner.
 *
 * Every action re-derives the caller's profile from the session rather than
 * trusting an id in the payload, and every write still goes through RLS as that
 * user. The ownership check here is the readable first line; the database is
 * the one that cannot be talked out of it.
 */

export type SaveResult =
  | { ok: true; revision: string }
  | { ok: false; reason: "conflict" | "invalid" | "error"; message: string };

/**
 * Persist the whole draft.
 *
 * The client owns the document while editing and sends it back in full, so this
 * is a replace rather than a patch: upsert everything present, delete anything
 * absent. With a profile's worth of blocks that is two statements, and it means
 * the saved state can never drift from what is on screen.
 *
 * `revision` is the profiles.updated_at the client last saw. The compare-and-set
 * below turns a second tab into a clean conflict instead of a silent overwrite.
 */
export async function saveDraft(
  revision: string,
  documentInput: unknown,
): Promise<SaveResult> {
  const user = await requireUser();

  const document = parseEditorDocument(documentInput);
  if (!document) {
    return { ok: false, reason: "invalid", message: "That draft didn't parse." };
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.id !== document.profile.id) {
    return { ok: false, reason: "error", message: "No profile to save." };
  }

  const { data: updated, error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: document.profile.displayName || null,
      bio: document.profile.bio || null,
      avatar_url: document.profile.avatarUrl || null,
      status: document.profile.status || null,
      location: document.profile.location || null,
      seo_title: document.profile.seoTitle || null,
      seo_description: document.profile.seoDescription || null,
      og_image_url: document.profile.ogImageUrl || null,
      visibility: document.profile.visibility,
      directory_opt_in: document.profile.directoryOptIn,
      directory_persona: document.profile.directoryPersona || null,
      theme: document.theme,
      layout: document.layout,
    })
    .eq("id", profile.id)
    .eq("updated_at", revision)
    .select("updated_at")
    .maybeSingle();

  if (profileError) {
    return { ok: false, reason: "error", message: profileError.message };
  }

  if (!updated) {
    // The row exists (we just read it), so a zero-row update means updated_at
    // moved: someone saved from another tab.
    return {
      ok: false,
      reason: "conflict",
      message: "This profile was edited somewhere else.",
    };
  }

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("is_home", true)
    .maybeSingle();

  if (!page) {
    return { ok: false, reason: "error", message: "No page to save into." };
  }

  if (document.blocks.length > 0) {
    const { error: blocksError } = await supabase.from("blocks").upsert(
      document.blocks.map((block, index) => ({
        id: block.id,
        page_id: page.id,
        type: block.type,
        position: index,
        props: block.props,
        style: block.style,
        visible: block.visible,
      })),
      { onConflict: "id" },
    );

    if (blocksError) {
      return { ok: false, reason: "error", message: blocksError.message };
    }
  }

  const keptIds = document.blocks.map((block) => block.id);
  const deleteQuery = supabase.from("blocks").delete().eq("page_id", page.id);
  const { error: deleteError } = keptIds.length
    ? await deleteQuery.not("id", "in", `(${keptIds.join(",")})`)
    : await deleteQuery;

  if (deleteError) {
    return { ok: false, reason: "error", message: deleteError.message };
  }

  return { ok: true, revision: updated.updated_at };
}

export type PublishResult =
  | { ok: true; username: string }
  | { ok: false; message: string };

/**
 * Publish.
 *
 * The snapshot is built inside the database by `publish_profile()`, from the
 * caller's own rows, so there is no request in which a client can publish
 * content it does not own or content that differs from its saved draft.
 */
export async function publishProfile(): Promise<PublishResult> {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("publish_profile");

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Couldn't publish." };
  }

  revalidateProfile(data.username);
  revalidateTag("sitemap", "max");
  revalidateTag("directory", "max");

  // Publishing is the one moment the set of images a profile actually uses is
  // settled, so it is the right moment to clean up the ones it does not. The
  // sweep only touches uploads older than a day, and a failure here must never
  // turn a successful publish into an error the user sees.
  void collectImageUrls(data.snapshot)
    .then((urls) => sweepUnusedAssets(urls))
    .catch(() => undefined);

  return { ok: true, username: data.username };
}

/**
 * Every image URL referenced anywhere in a published snapshot.
 *
 * A recursive walk rather than a per-block list: block props are open-ended
 * JSON, and a new block type with a new image field should not silently start
 * having its images swept away.
 */
async function collectImageUrls(snapshot: unknown): Promise<string[]> {
  const urls: string[] = [];

  const walk = (value: unknown) => {
    if (typeof value === "string") {
      if (value.includes("/profile-media/")) urls.push(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (value && typeof value === "object") {
      for (const item of Object.values(value)) walk(item);
    }
  };

  walk(snapshot);
  return urls;
}

export async function unpublishProfile(): Promise<PublishResult> {
  await requireUser();

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .maybeSingle();

  const { error } = await supabase.rpc("unpublish_profile");
  if (error) return { ok: false, message: error.message };

  revalidateProfile(profile?.username);
  revalidateTag("sitemap", "max");
  revalidateTag("directory", "max");

  return { ok: true, username: profile?.username ?? "" };
}

export type RenameResult =
  | { ok: true; username: string }
  | { ok: false; message: string };

/**
 * Change the username.
 *
 * Both handles have to be invalidated: the old URL must start 404ing and the
 * new one must start resolving. The database keeps the denormalized username on
 * profile_publications in step; this keeps the cache in step.
 */
export async function renameUsername(next: string): Promise<RenameResult> {
  await requireUser();

  const parsed = usernameSchema.safeParse(next);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid name" };
  }

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("profiles")
    .select("username")
    .maybeSingle();

  const { data, error } = await supabase.rpc("rename_username", {
    p_username: parsed.data,
  });

  if (error || !data) {
    const taken =
      error?.code === "23505" || error?.message?.includes("not available");
    return {
      ok: false,
      message: taken ? "That name is taken." : "Couldn't change your username.",
    };
  }

  revalidateProfile(current?.username, data.username);
  revalidateTag("sitemap", "max");
  revalidateTag("directory", "max");

  return { ok: true, username: data.username };
}
