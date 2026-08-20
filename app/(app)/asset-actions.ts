"use server";

import { createClient, requireUser } from "@/lib/supabase/server";

/**
 * The ledger of uploaded files.
 *
 * Storage itself has no notion of a per-account quota, so every upload is
 * mirrored into public.assets where a trigger enforces one. The row is also
 * what the orphan sweep works from — an object nothing references can be found
 * and deleted, which is the difference between a storage bill that grows with
 * users and one that grows with abandoned drafts.
 */

export type RecordAssetResult = { ok: true; id: string } | { ok: false; message: string };

export async function recordAsset(input: {
  path: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
}): Promise<RecordAssetResult> {
  const user = await requireUser();

  // The storage policy already enforces this prefix; checking again here means
  // a mismatched path is a clear error rather than a row pointing at a file the
  // user cannot actually reach.
  if (!input.path.startsWith(`${user.id}/`)) {
    return { ok: false, message: "That upload doesn't belong to you." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assets")
    .insert({
      user_id: user.id,
      bucket: "profile-media",
      path: input.path,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      width: input.width,
      height: input.height,
    })
    .select("id")
    .single();

  if (error || !data) {
    const quota = error?.message?.includes("quota") || error?.message?.includes("limit");
    return {
      ok: false,
      message: quota
        ? "You've hit your storage limit. Delete something first."
        : "Couldn't save that upload.",
    };
  }

  return { ok: true, id: data.id };
}

/**
 * Delete uploads that nothing points at any more.
 *
 * Run after publishing, when the set of referenced URLs is settled. Only files
 * older than a day are considered, so an image uploaded seconds ago and not yet
 * attached to a block is never swept out from under the user.
 */
export async function sweepUnusedAssets(referencedUrls: string[]): Promise<number> {
  const user = await requireUser();
  const supabase = await createClient();

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: assets } = await supabase
    .from("assets")
    .select("id, path")
    .eq("user_id", user.id)
    .lt("created_at", cutoff);

  if (!assets?.length) return 0;

  const referenced = new Set(
    referencedUrls
      .map((url) => {
        const marker = "/profile-media/";
        const index = url.indexOf(marker);
        return index === -1 ? null : url.slice(index + marker.length);
      })
      .filter((path): path is string => Boolean(path)),
  );

  const orphans = assets.filter((asset) => !referenced.has(asset.path));
  if (orphans.length === 0) return 0;

  await supabase.storage
    .from("profile-media")
    .remove(orphans.map((asset) => asset.path));

  await supabase
    .from("assets")
    .delete()
    .in(
      "id",
      orphans.map((asset) => asset.id),
    );

  return orphans.length;
}
