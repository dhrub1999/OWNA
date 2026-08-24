"use client";

import { useEffect, useRef } from "react";

/**
 * The product recording that sits inside the hero device.
 *
 * The raw capture scrolls a whole profile in 12.7s, which is too fast to read,
 * so it plays at 0.7x. Looping is manual rather than `loop` because the
 * recording ends mid-page: on `ended` we rewind and hold at the top for a
 * moment, which both covers the loop seam and gives a visitor time to register
 * the person's name and role before the scroll starts again.
 */
const PLAYBACK_RATE = 0.7;
const TOP_OF_LOOP_HOLD_MS = 1200;

export function HeroFootage({
  className,
  poster,
}: {
  className?: string;
  poster: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let holding = false;

    function play() {
      if (!video || reduceMotion.matches) return;
      video.playbackRate = PLAYBACK_RATE;
      // Autoplay can still be refused (low power mode, a per-site setting).
      // The poster is already painted underneath, so a refusal is a no-op.
      void video.play().catch(() => {});
    }

    function clearHold() {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = undefined;
      holding = false;
    }

    function onEnded() {
      if (!video) return;
      video.currentTime = 0;
      holding = true;
      holdTimer = setTimeout(() => {
        holding = false;
        play();
      }, TOP_OF_LOOP_HOLD_MS);
    }

    // First playback deliberately does not wait on the observer: inside
    // iframes and embedded previews `rootBounds` is null and a threshold-based
    // callback may never fire, which would leave the hero frozen on its poster.
    play();
    video.addEventListener("ended", onEnded);

    // Gate on the ratio rather than `isIntersecting` for the same reason —
    // with a null root the ratio is still reported correctly.
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio > 0) {
          if (!holding) play();
        } else {
          video.pause();
          clearHold();
        }
      }
    });
    observer.observe(video);

    function onMotionPreferenceChange() {
      if (!video) return;
      if (reduceMotion.matches) {
        video.pause();
        video.currentTime = 0;
        clearHold();
      } else {
        play();
      }
    }
    reduceMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      observer.disconnect();
      video.removeEventListener("ended", onEnded);
      reduceMotion.removeEventListener("change", onMotionPreferenceChange);
      clearHold();
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      playsInline
      preload="auto"
      // Above the fold and the subject of the section, so never lazy-loaded.
      aria-label="A published OWNA profile scrolling: a portrait and name, a short bio, social links, then a portfolio of project cards."
    >
      <source src="/assets/hero-section/product-result.mp4" type="video/mp4" />
    </video>
  );
}
