import type { GalleryImagePosition, GalleryImageShape } from "./definitions";

const OBJECT_POSITION: Record<GalleryImagePosition, string> = {
  "top-left": "0% 0%",
  "top-center": "50% 0%",
  "top-right": "100% 0%",
  "center-left": "0% 50%",
  center: "50% 50%",
  "center-right": "100% 50%",
  "bottom-left": "0% 100%",
  "bottom-center": "50% 100%",
  "bottom-right": "100% 100%",
};

export function objectPositionFor(position: GalleryImagePosition): string {
  return OBJECT_POSITION[position] ?? "50% 50%";
}

/** Intrinsic size hints for next/image per bento shape, so the generated
 *  srcset roughly matches the final cropped aspect ratio. The displayed box
 *  is still fully governed by CSS (object-fit: cover), so this is a
 *  bandwidth/quality optimization, not a correctness requirement. */
export const BENTO_INTRINSIC_SIZE: Record<
  GalleryImageShape,
  { width: number; height: number }
> = {
  square: { width: 900, height: 900 },
  landscape: { width: 1200, height: 800 },
  portrait: { width: 800, height: 1200 },
};
