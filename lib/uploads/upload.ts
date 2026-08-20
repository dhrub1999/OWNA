"use client";

import { recordAsset } from "@/app/(app)/asset-actions";
import { createClient } from "@/lib/supabase/client";
import { compressImage, validateFile } from "./compress";

export const MEDIA_BUCKET = "profile-media";

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string };

/**
 * Upload straight from the browser to Supabase Storage.
 *
 * The object key starts with the user's id, and the storage policy requires
 * that prefix to match auth.uid(). That is what makes a direct browser upload
 * safe: there is no service-role key involved and no server route to abuse —
 * the database refuses to write outside your own folder.
 *
 * The asset row is recorded afterwards through a Server Action, which is where
 * the per-account quota is enforced.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const invalid = validateFile(file);
  if (invalid) return { ok: false, message: invalid };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You're signed out. Reload and try again." };

  const compressed = await compressImage(file);
  const path = `${user.id}/${crypto.randomUUID()}.${compressed.extension}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, compressed.blob, {
      contentType: compressed.mimeType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    return { ok: false, message: error.message };
  }

  const recorded = await recordAsset({
    path,
    mimeType: compressed.mimeType,
    sizeBytes: compressed.blob.size,
    width: compressed.width || null,
    height: compressed.height || null,
  });

  if (!recorded.ok) {
    // The quota trigger rejected it, so the object should not linger in the
    // bucket unreferenced.
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    return { ok: false, message: recorded.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return { ok: true, url: publicUrl, path };
}
