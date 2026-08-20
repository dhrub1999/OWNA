"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { safeImageSrc } from "@/lib/validations/url";

type LightboxImage = { url: string; alt: string; caption: string };

/**
 * Click-to-enlarge for the gallery.
 *
 * The grid itself is rendered by the server as `children` and never crosses the
 * client boundary. This wrapper only listens for clicks on the tiles via
 * delegation, which is why the whole interactive layer costs one small island
 * instead of turning every gallery image into client-rendered markup.
 *
 * Tiles are real <button> elements, so Enter and Space arrive here as clicks
 * and keyboard users get the same behaviour as mouse users for free.
 */
export function GalleryLightbox({
  images,
  children,
}: {
  images: LightboxImage[];
  children: React.ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length],
  );

  const onContainerClick = useCallback((event: React.MouseEvent) => {
    const tile = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-gallery-index]",
    );
    if (!tile) return;
    const index = Number(tile.dataset.galleryIndex);
    if (Number.isNaN(index)) return;
    returnFocusRef.current = tile;
    setOpenIndex(index);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, step]);

  const active = openIndex === null ? null : images[openIndex];
  const activeSrc = active ? safeImageSrc(active.url) : undefined;

  return (
    <>
      {/* A delegation target, not a control. The focusable, keyboard-operable
          elements are the <button> tiles inside, whose clicks bubble to here. */}
      <div onClick={onContainerClick}>{children}</div>

      {active && activeSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt || active.caption || "Image"}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
          ) : null}

          {/* An arbitrary host, and past the initial paint either way. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSrc}
            alt={active.alt}
            className="max-h-[82vh] max-w-full rounded-lg object-contain"
          />

          {active.caption ? (
            <p className="max-w-prose text-center text-sm text-white/80">
              {active.caption}
            </p>
          ) : null}

          {images.length > 1 ? (
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
