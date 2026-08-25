"use client";

import { useMemo } from "react";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { hexToRgb } from "@/lib/themes/contrast";
import { FALLBACK_PURPOSE, previewSnapshot, type PreviewAnswers } from "@/lib/onboarding/preview-snapshot";
import { profileUrlLabel } from "@/lib/site";

/**
 * The page being described, rendered live beside the questions, inside a
 * phone mockup.
 *
 * It mounts the real `ProfileRenderer`, not a mock-up of one, so what someone
 * sees while answering is the same component that will serve their public URL.
 * A hand-drawn approximation would drift from the real thing the first time a
 * block's styling changed, and it would drift silently.
 *
 * Rendered at its true width, not scaled down: `SCREEN_WIDTH` sits well under
 * the container-query breakpoints in `app/profile.css` (the lowest is 30rem /
 * 480px), so the blocks pick their real mobile layout on their own — the
 * point of a phone mockup is showing what a visitor's own phone will actually
 * render, not a shrunk desktop page.
 */
const SCREEN_WIDTH = 300;
const SCREEN_HEIGHT = 620;
const BEZEL = 7;

export function LivePreview({
  answers,
  className,
}: {
  answers: PreviewAnswers;
  className?: string;
}) {
  // Rebuilding the template on every keystroke is wasted work; only the
  // profile fields change between most renders.
  const snapshot = useMemo(
    () => previewSnapshot(answers),
    [answers],
  );

  // The glow behind the phone picks up the template's own accent colour —
  // the same one the hero's status dot renders in — so the mockup visibly
  // belongs to the style just chosen instead of sitting in a generic void.
  // A saturated accent read as a neon blob against a light-mode background,
  // so light mode gets it desaturated toward grey rather than the raw colour;
  // dark mode keeps the full accent, which is what it was tuned against.
  const accent = hexToRgb(snapshot.theme.colors.accent) ?? { r: 0, g: 0, b: 0 };
  const mutedAccent = mixWithGray(accent, 0.55);
  const glowVars = {
    "--glow-light": `${mutedAccent.r} ${mutedAccent.g} ${mutedAccent.b}`,
    "--glow-dark": `${accent.r} ${accent.g} ${accent.b}`,
  } as React.CSSProperties;

  return (
    <div className={className}>
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center">
        <UrlChip username={answers.username} />

        <div
          className="relative mt-8"
          style={{ width: SCREEN_WIDTH + BEZEL * 2, height: SCREEN_HEIGHT + BEZEL * 2 }}
          aria-hidden="true"
        >
          {/* Ambient glow, colour-matched to the active theme and swapped
              instantly with it — a flat void behind the phone read as unfinished.
              Lighter and more muted in light mode; fuller in dark mode, where
              it was tuned against a near-black pane. */}
          <div
            className="pointer-events-none absolute -inset-14 z-0 rounded-full bg-[rgb(var(--glow-light))] opacity-35 blur-[60px] transition-colors duration-700 dark:-inset-20 dark:bg-[rgb(var(--glow-dark))] dark:opacity-55 dark:blur-[80px]"
            style={glowVars}
          />

          {/* Chassis. Deliberately theme-independent (graphite, not the page's
              own colours) — a device mockup reads as premium precisely because
              it looks like real hardware, not another themed surface. Thin,
              close to the screen's own radius, matching how little bezel a
              real phone shows rather than a thick toy-like frame. The drop
              shadow is lighter in light mode, where a heavy black shadow reads
              as a smudge against a pale pane, and a step down from its original
              weight in dark mode too. */}
          <div className="absolute inset-0 z-10 rounded-[40px] bg-gradient-to-b from-neutral-900 to-black shadow-[0_18px_40px_-18px_rgb(0_0_0/0.28)] ring-1 ring-white/10 dark:shadow-[0_28px_65px_-22px_rgb(0_0_0/0.5)]">
            {/* Side controls, protruding past the chassis edge. */}
            <span className="absolute top-24 -left-[2px] h-8 w-[2px] rounded-l-sm bg-neutral-700" />
            <span className="absolute top-36 -left-[2px] h-12 w-[2px] rounded-l-sm bg-neutral-700" />
            <span className="absolute top-32 -right-[2px] h-16 w-[2px] rounded-r-sm bg-neutral-700" />

            {/* Screen. Its own background matches the rendering theme's page
                colour, not the app shell's, so a short page's empty space
                still reads as "that page", not a mismatched seam. */}
            <div
              className="absolute overflow-hidden rounded-[33px]"
              style={{ inset: BEZEL, backgroundColor: snapshot.theme.colors.background }}
            >
              <div
                key={answers.purpose || FALLBACK_PURPOSE}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
                style={{ width: SCREEN_WIDTH }}
              >
                <ProfileRenderer snapshot={snapshot} />
              </div>

              {/* The page continues past the screen; fading the cut edge reads
                  as "there is more, scroll on your own phone" rather than a
                  rendering glitch. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/25 to-transparent" />

              {/* Home indicator. */}
              <div className="pointer-events-none absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/40" />

              {/* Dynamic island, inside the screen's own clip so it never
                  overlaps the bezel — a slim pill with real headroom above it,
                  not a notch stretching edge to edge. */}
              <div className="pointer-events-none absolute top-[10px] left-1/2 h-[18px] w-20 -translate-x-1/2 rounded-full bg-black" />
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs text-balance">
          Example content in this style. Yours opens ready to edit.
        </p>
      </div>
    </div>
  );
}

/** Blends a colour toward mid-grey by `amount` (0 = untouched, 1 = flat grey). */
function mixWithGray(rgb: { r: number; g: number; b: number }, amount: number) {
  const toward = (channel: number) => Math.round(channel + (128 - channel) * amount);
  return { r: toward(rgb.r), g: toward(rgb.g), b: toward(rgb.b) };
}

function UrlChip({ username }: { username: string }) {
  const claimed = Boolean(username);

  return (
    <div className="flex justify-center">
      <span
        className={[
          "border-border bg-card inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors duration-300",
          claimed ? "text-foreground" : "text-muted-foreground",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "size-1.5 rounded-full transition-colors duration-300",
            claimed ? "bg-primary" : "bg-border",
          ].join(" ")}
        />
        {profileUrlLabel(username || "yourname")}
      </span>
    </div>
  );
}
