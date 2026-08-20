/**
 * Client-side image compression.
 *
 * Phone photos routinely arrive at 4000px and several megabytes. Resizing to a
 * sane maximum and re-encoding as WebP before upload typically cuts them by
 * around 70%, which keeps uploads fast, keeps profiles inside the storage quota
 * and means the public page is serving a reasonable file even before
 * next/image gets to it.
 *
 * Done with a canvas rather than a library: it is about sixty lines, it runs in
 * every browser we care about, and a dependency here would ship to the editor
 * bundle for something the platform already does.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  extension: string;
};

export type CompressOptions = {
  maxDimension?: number;
  quality?: number;
};

export function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME.includes(file.type)) {
    return "That file type isn't supported. Use JPG, PNG, WebP, AVIF or GIF.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`;
  }
  return null;
}

export async function compressImage(
  file: File,
  { maxDimension = 2000, quality = 0.85 }: CompressOptions = {},
): Promise<CompressedImage> {
  // An animated GIF would lose its animation on a canvas, so it is passed
  // through untouched and simply held to the same size limit.
  if (file.type === "image/gif") {
    const bitmap = await safeBitmap(file);
    return {
      blob: file,
      width: bitmap?.width ?? 0,
      height: bitmap?.height ?? 0,
      mimeType: file.type,
      extension: "gif",
    };
  }

  const bitmap = await safeBitmap(file);
  if (!bitmap) {
    // Decoding failed; upload the original rather than losing the user's file.
    return {
      blob: file,
      width: 0,
      height: 0,
      mimeType: file.type,
      extension: extensionFor(file.type),
    };
  }

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close?.();
    return {
      blob: file,
      width: bitmap.width,
      height: bitmap.height,
      mimeType: file.type,
      extension: extensionFor(file.type),
    };
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );

  // If WebP encoding produced nothing, or somehow produced a bigger file than
  // we started with, the original is the better answer.
  if (!blob || blob.size >= file.size) {
    return {
      blob: file,
      width,
      height,
      mimeType: file.type,
      extension: extensionFor(file.type),
    };
  }

  return { blob, width, height, mimeType: "image/webp", extension: "webp" };
}

async function safeBitmap(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file);
  } catch {
    return null;
  }
}

function extensionFor(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
    default:
      return "webp";
  }
}
