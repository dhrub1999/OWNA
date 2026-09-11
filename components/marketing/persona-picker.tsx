"use client";

import { useState } from "react";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { DEMO_PRESETS, PURPOSE_OPTIONS, demoProfiles, type DemoProfileId } from "@/lib/demo-profiles";
import { PRESETS_BY_ID } from "@/lib/themes/presets";
import { cn } from "@/lib/utils";

/**
 * Section 3: "Start from where you actually are."
 *
 * The five options are the same `PURPOSE_OPTIONS` the real onboarding
 * questionnaire asks, and the preview on the right is the same
 * `demoProfiles` entry `templateForPurpose()` seeds a real draft from — so
 * picking "Photography" here shows exactly the page shape a visitor gets by
 * picking it for real. The preview needs no width prop: `.profile-root` is a
 * CSS container (`container-type: inline-size` in profile.css), so it reads
 * its own rendered width directly rather than a measured-and-passed-down one.
 */
export function PersonaPicker() {
  const [persona, setPersona] = useState<DemoProfileId>("photographer");
  const snapshot = demoProfiles[persona];
  const presetName = PRESETS_BY_ID[DEMO_PRESETS[persona]].name;

  return (
    <section className="border-t border-border bg-card py-[clamp(64px,8vw,112px)]">
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <div className="flex max-w-[860px] flex-col gap-4.5">
          <h2 className="font-display text-[clamp(27px,4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
            Start from where you actually are.
          </h2>
          <p className="max-w-[56ch] text-[clamp(16px,1.5vw,19px)] leading-[1.55] text-muted-foreground">
            The builder opens with one question. Your answer picks the blocks and the theme, so the first
            thing you see is a page — not an empty canvas.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-start gap-[clamp(28px,3vw,56px)]">
          <div className="min-w-0 flex-[1_1_320px]">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              What is this page for?
            </p>
            <div className="flex flex-col gap-2">
              {PURPOSE_OPTIONS.map((option) => {
                const active = option.id === persona;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPersona(option.id)}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-[14px] border px-4.5 py-4 text-left transition-colors duration-200",
                      active
                        ? "border-primary bg-[var(--ow-accent-soft)]"
                        : "border-border bg-background hover:border-foreground/25",
                    )}
                  >
                    <span className="text-base font-semibold">{option.label}</span>
                    <span className="text-sm leading-relaxed text-muted-foreground">{option.description}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground">
              Five starting points, five themes. Whichever you pick, every block, colour and corner stays
              editable afterwards.
            </p>
          </div>

          <div className="min-w-0 flex-[1_1_420px]">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <p className="font-mono text-xs text-muted-foreground">owna.online/{snapshot.profile.username}</p>
              <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                {presetName} theme
              </p>
            </div>
            <div className="h-[clamp(400px,92vw,560px)] overflow-hidden rounded-[20px] border border-border bg-background [mask-image:linear-gradient(to_bottom,#000_82%,transparent_99%)]">
              <div className="pointer-events-none h-full overflow-hidden">
                <ProfileRenderer snapshot={snapshot} isPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
