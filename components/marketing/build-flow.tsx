"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlockIcon } from "@/components/icons/block-icon";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { BuildFlowPreview } from "@/components/marketing/build-flow-preview";
import { BLOCK_META } from "@/lib/blocks/definitions";
import {
  BUILD_FLOW_BLOCK_COUNT,
  BUILD_FLOW_PRESETS,
  BUILD_FLOW_USERNAME,
  TOTAL_PRESET_COUNT,
} from "@/lib/marketing/build-flow-presets";
import { cn } from "@/lib/utils";

/**
 * Section 3: build, customize, publish.
 *
 * A scroll-pinned split above 1100px — the editor on the left, the page it
 * produces on the right. Three sentinels, one IntersectionObserver, and the
 * sentinel crossing the viewport midline decides the step. There is no scroll
 * listener anywhere: `scrollY` in React state re-renders on every frame, and
 * this stage re-renders a whole profile.
 *
 * Below 1100px it unpins entirely. A 100dvh pin with two panes has nowhere to
 * go on a phone, so the sentinels and the spacer are removed and the steps
 * change only by pressing a step row — which is why those rows are real
 * buttons rather than clickable divs.
 */

const STEPS = [
  { label: "Build", copy: "Choose what belongs on your page." },
  { label: "Customize", copy: "Make it look like you." },
  { label: "Publish", copy: "Go live when you're ready." },
] as const;

/** Matches the sentinel height, so one step is one viewport of scrolling. */
const SENTINEL = "h-[100dvh] min-h-[660px]";

const PANEL =
  "flex flex-col gap-[18px] rounded-[24px] border border-border bg-card p-6";
const GROUP_LABEL =
  "font-mono text-[10px] tracking-[0.16em] text-muted-foreground";
const NOTE =
  "border-t border-border pt-3.5 text-sm leading-[1.5] text-muted-foreground";

export function BuildFlow() {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [themeIndex, setThemeIndex] = useState(0);

  // Not rendered, so a ref rather than state: whether the visitor has picked a
  // preset themselves, which switches off the auto-apply below.
  const themeTouched = useRef(false);

  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const reduce = useReducedMotion();
  // An IntersectionObserver under the hood, and the only reason the stagger
  // needs one: below 1100px the sentinels are gone, so entering Build can never
  // fire and the preview would otherwise sit at one block forever.
  const stageInView = useInView(stageRef, { once: true, margin: "-20%" });

  const enter = useCallback((index: number) => {
    setStep(index);
    if (index > 0) {
      setRevealed(BUILD_FLOW_BLOCK_COUNT);
      // Entering Customize applies a second preset, which is the point of the
      // step: the light-on-dark flip is the most convincing thing here. A
      // visitor who has already picked one keeps theirs.
      setThemeIndex((current) =>
        themeTouched.current || current !== 0 ? current : 1,
      );
    }
  }, []);

  useEffect(() => {
    const nodes = [r0.current, r1.current, r2.current].filter(
      (node): node is HTMLDivElement => node !== null,
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.indexOf(entry.target as HTMLDivElement);
          if (index >= 0) enter(index);
        }
      },
      // Whichever sentinel is crossing the middle of the viewport wins.
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [enter]);

  useEffect(() => {
    if (reduce || !stageInView) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let n = 2; n <= BUILD_FLOW_BLOCK_COUNT; n += 1) {
      timers.push(
        setTimeout(
          () => setRevealed((current) => Math.max(current, n)),
          260 + (n - 2) * 320,
        ),
      );
    }
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [stageInView, reduce]);

  const preset = BUILD_FLOW_PRESETS[themeIndex];
  const motionClass = reduce ? "" : "transition-all duration-[350ms]";

  // Derived rather than pushed into state by an effect: with reduced motion the
  // page is simply already built, and the stagger below never runs.
  const shown = reduce ? BUILD_FLOW_BLOCK_COUNT : revealed;

  const chip = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm",
      motionClass,
      active
        ? "border-primary bg-primary/12 text-foreground"
        : "border-border bg-secondary text-foreground/85",
    );

  return (
    <section className="bg-background pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <BlurFade inView direction="up" className="flex max-w-[900px] flex-col gap-5">
          <h2 className="font-display max-w-[22ch] text-[clamp(34px,4.6vw,56px)] leading-[1.03] font-extrabold tracking-[-0.035em] text-balance">
            It builds like a page, not like a website.
          </h2>
          <p className="max-w-[54ch] text-[clamp(17px,1.6vw,20px)] leading-[1.5] text-muted-foreground">
            No template to fight, no hosting, no deploy. Three moves, and the URL
            is yours.
          </p>
        </BlurFade>
      </div>

      <div className="relative mt-16">
        <div
          ref={stageRef}
          className={cn(
            "flex pb-24",
            "stage:sticky stage:top-0 stage:h-[100dvh] stage:min-h-[660px] stage:items-center stage:overflow-hidden stage:pb-0",
          )}
        >
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 sm:px-12 stage:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] stage:gap-14">
            {/* Left: the editor */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-0.5">
                {STEPS.map((item, index) => {
                  const active = step === index;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => enter(index)}
                      className={cn(
                        "focus-visible:ring-ring cursor-pointer border-l-2 py-4 pl-5 text-left focus-visible:ring-2 focus-visible:outline-none",
                        reduce ? "" : "transition-colors duration-[350ms]",
                        active ? "border-primary" : "border-border",
                      )}
                    >
                      <span className="flex flex-wrap items-baseline gap-3.5">
                        <span
                          className={cn(
                            "text-[clamp(21px,2.2vw,26px)] font-bold tracking-[-0.025em]",
                            reduce ? "" : "transition-colors duration-[350ms]",
                            // No opacity multiplier: dimming the whole row is
                            // what failed contrast in the first draft.
                            active ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="text-[15px] text-muted-foreground">
                          {item.copy}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {step === 0 ? (
                <div className={PANEL}>
                  {/* The real block library, grouped the way
                      components/editor/block-library.tsx groups it. */}
                  <div className="flex flex-col gap-2.5">
                    <p className={GROUP_LABEL}>YOU</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div
                        className={cn(
                          chip(false),
                          // A singleton already on the page: the library
                          // disables it rather than hiding it.
                          "opacity-50",
                        )}
                      >
                        <BlockIcon
                          type="hero"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                        {BLOCK_META.hero.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <p className={GROUP_LABEL}>CONTENT</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(["text", "social", "links", "projects"] as const).map(
                        (type) => (
                          <div
                            key={type}
                            className={chip(
                              (type === "social" && shown > 1) ||
                                (type === "projects" && shown > 2),
                            )}
                          >
                            <BlockIcon
                              type={type}
                              className="size-4 shrink-0 text-muted-foreground"
                            />
                            {BLOCK_META[type].label}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <p className={GROUP_LABEL}>MEDIA</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["image", "gallery", "embed"] as const).map((type) => (
                        <div
                          key={type}
                          className={chip(type === "gallery" && shown > 3)}
                        >
                          <BlockIcon
                            type={type}
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                          <span className="truncate">
                            {BLOCK_META[type].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <p className={GROUP_LABEL}>STRUCTURE</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className={chip(false)}>
                        <BlockIcon
                          type="divider"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                        {BLOCK_META.divider.label}
                      </div>
                    </div>
                  </div>

                  <p className={NOTE}>
                    Blocks reorder by dragging. Anything you leave out never
                    renders.
                  </p>
                </div>
              ) : null}

              {step === 1 ? (
                <div className={PANEL}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={GROUP_LABEL}>THEME</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {BUILD_FLOW_PRESETS.length} of {TOTAL_PRESET_COUNT}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {BUILD_FLOW_PRESETS.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={themeIndex === index}
                        onClick={() => {
                          themeTouched.current = true;
                          setThemeIndex(index);
                        }}
                        className={cn(
                          "focus-visible:ring-ring flex cursor-pointer flex-col gap-2.5 rounded-[14px] border p-3.5 text-left focus-visible:ring-2 focus-visible:outline-none",
                          motionClass,
                          themeIndex === index
                            ? "border-primary bg-primary/12"
                            : "border-border bg-secondary",
                        )}
                      >
                        <span className="flex gap-1.5" aria-hidden="true">
                          <span
                            className="size-4 rounded-full"
                            style={{ background: item.accent }}
                          />
                          <span
                            className="size-4 rounded-full border"
                            style={{
                              background: item.background,
                              borderColor: item.border,
                            }}
                          />
                        </span>
                        <span className="text-[13px]">{item.name}</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[15px] leading-[1.5] text-foreground/85">
                    {preset.description}
                  </p>

                  <dl className="flex flex-wrap gap-7">
                    {[
                      ["HEADING", preset.headingFont],
                      ["BODY", preset.bodyFont],
                      ["CARD RADIUS", preset.cardRadius],
                      ["LAYOUT", preset.layoutLabel],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <dt className={GROUP_LABEL}>{label}</dt>
                        <dd className="text-sm">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className={NOTE}>
                    A preset is a starting point, not a mode. Every colour, font
                    and corner stays editable afterwards.
                  </p>
                </div>
              ) : null}

              {step === 2 ? (
                <div className={PANEL}>
                  {/* A fragment of the real editor toolbar. */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-primary"
                        />
                        Saved
                      </span>
                      <span>View</span>
                    </div>
                    <span className="rounded-full bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground">
                      Publish
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3.5">
                    <span className="font-mono text-sm">
                      owna.online/{BUILD_FLOW_USERNAME}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      available
                    </span>
                  </div>

                  <p className={NOTE}>
                    Live in a second. Every edit after this one goes out the same
                    way, with no rebuild.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Right: the page it produces */}
            <div className="flex flex-col items-center gap-3.5">
              <BuildFlowPreview
                preset={preset}
                revealed={shown}
                isPublished={step === 2}
              />
              <p
                className={cn(
                  "font-mono text-xs",
                  reduce ? "" : "transition-colors duration-500",
                  step === 2 ? "text-foreground" : "text-muted-foreground",
                )}
              >
                owna.online/{BUILD_FLOW_USERNAME}
              </p>
            </div>
          </div>
        </div>

        {/* The sentinels decide the step; the spacer gives the section the
            scroll length the pin needs. Both are dead weight once unpinned. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden stage:block"
        >
          <div ref={r0} className={SENTINEL} />
          <div ref={r1} className={SENTINEL} />
          <div ref={r2} className={SENTINEL} />
        </div>
        <div
          aria-hidden="true"
          className="hidden h-[300dvh] min-h-[1980px] stage:block"
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-32 sm:px-12">
        <div className="flex flex-col items-start gap-6 border-t border-border pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="max-w-[52ch] text-[18px] leading-[1.55] text-muted-foreground">
            There is no hosting dashboard to open, and no build to wait on.
          </p>
          <StartBuildingButton className="h-14 shrink-0 rounded-full px-8 text-base font-semibold transition-transform active:scale-[0.98]">
            Create your OWNA
          </StartBuildingButton>
        </div>
      </div>
    </section>
  );
}
