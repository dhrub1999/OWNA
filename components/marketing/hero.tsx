import Link from "next/link";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { HeroFootage } from "@/components/marketing/hero-footage";
import { Button } from "@/components/ui/button";

const POSTER = "/assets/hero-section/poster-frame.png";

/**
 * The marketing hero.
 *
 * Two distinct compositions rather than one fluid layout: above `lg` the
 * footage sits inside a device that is deliberately clipped by the section's
 * bottom edge, with the headline running over its left bezel. Below `lg` the
 * device is dropped — a phone inside a phone is redundant — and the footage
 * becomes a rotated block bleeding off the right edge with the copy over it.
 *
 * Colour is attributed, not decorative: cobalt is marketing chrome (the primary
 * CTA) and lime belongs to the profile in the footage, so it appears only
 * inside the device and in the glow it casts. Nothing else introduces colour.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F7F5F1] text-[#0C0B0A] dark:bg-[#0C0B0A] dark:text-[#F8F6F2]">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-12">
        {/* The profile's own accent spilling onto the page. Dark mode only —
            in light mode it would read as a stain rather than a light source. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[180px] right-4 hidden h-[760px] w-[760px] rounded-full blur-[16px] xl:dark:block"
          style={{
            background:
              "radial-gradient(circle, rgba(184,240,60,0.14), rgba(184,240,60,0) 60%)",
          }}
        />

        {/* Desktop device. `top` + its height overrun the section's height, and
            the section clips — the cut-off bottom is the composition. */}
        <div className="pointer-events-none absolute top-[132px] right-12 hidden h-[760px] w-[384px] -rotate-2 rounded-[52px] bg-[#1A1A1C] p-[10px] shadow-[0_2px_0_rgba(255,255,255,0.16)_inset,0_46px_80px_-26px_rgba(20,18,14,0.5)] xl:block dark:shadow-[0_2px_0_rgba(255,255,255,0.16)_inset,0_50px_90px_-24px_rgba(0,0,0,0.75)]">
          {/* Screen background matches the profile's own dark olive so there is
              no flash of a different colour before the first frame paints. */}
          <div className="relative h-full w-full overflow-hidden rounded-[43px] bg-[#14170F]">
            <HeroFootage
              poster={POSTER}
              // The 1.07 crop takes the source recording's scrollbar sliver off
              // the right edge.
              className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-[1.07] object-cover"
            />

            {/* Hides the loop seam and seats the status bar. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-20"
              style={{
                background:
                  "linear-gradient(to bottom, #14170F 34%, rgba(20,23,15,0))",
              }}
            />

            <div
              aria-hidden
              className="absolute inset-x-0 top-0 flex h-12 items-center justify-between px-[30px]"
            >
              <span className="text-[14px] font-semibold text-[#F8F6F2]">
                9:41
              </span>
              <span className="flex items-center gap-[6px]">
                <span className="flex items-end gap-[2px]">
                  <span className="h-1 w-[3px] rounded-full bg-[#F8F6F2]" />
                  <span className="h-1.5 w-[3px] rounded-full bg-[#F8F6F2]" />
                  <span className="h-2 w-[3px] rounded-full bg-[#F8F6F2]" />
                  <span className="h-2.5 w-[3px] rounded-full bg-[#F8F6F2] opacity-40" />
                </span>
                <span className="flex h-3 w-[23px] items-center rounded-[3px] border border-[#F8F6F2]/55 p-[1.5px]">
                  <span className="h-full w-[70%] rounded-[1px] bg-[#F8F6F2]" />
                </span>
              </span>
            </div>

            <div
              aria-hidden
              className="absolute top-3 left-1/2 h-8 w-[116px] -translate-x-1/2 rounded-full bg-black"
            />
          </div>
        </div>

        {/* Mobile footage. The negative right inset plus the rotation are what
            make the block bleed off the right edge. */}
        <div className="pointer-events-none absolute right-[-60px] bottom-0 left-0 h-[470px] origin-bottom-left -rotate-2 overflow-hidden rounded-tl-[26px] bg-[#14170F] sm:h-[560px] xl:hidden">
          <HeroFootage
            poster={POSTER}
            className="h-full w-full scale-[1.06] object-cover object-top"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-[90px] dark:block"
            style={{
              background:
                "linear-gradient(to bottom, #0C0B0A, rgba(12,11,10,0))",
            }}
          />
        </div>

        <div className="relative z-20 max-w-[840px] pt-[72px] pb-[400px] sm:pb-[500px] xl:pt-[176px] xl:pb-[208px]">
          {/* Line breaks are explicit and differ between compositions: the
              desktop breaks are tuned to cross the device's bezel, the mobile
              ones to the narrower column.

              The desktop size is 82px rather than the spec's 76px: that number
              was measured against Plus Jakarta Sans in a 1240px frame, and both
              changed here (Parkinsans, and the site's 1280px container). 82px is
              what reproduces the thing the number was for — the widest line
              crossing onto the device's bezel by ~25px. */}
          <h1 className="text-[42px] leading-[1.04] font-extrabold tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(247,245,241,0.7)] sm:text-[56px] xl:text-[82px] xl:leading-[1.0] xl:tracking-[-0.038em] dark:[text-shadow:0_2px_24px_rgba(12,11,10,0.55)]">
            <span className="xl:hidden">
              Your online
              <br />
              presence should
              <br />
              feel like you.
            </span>
            <span className="hidden xl:inline">
              Your online presence
              <br />
              should feel
              <br />
              like you.
            </span>
          </h1>

          <p className="mt-[22px] max-w-[300px] text-[16px] leading-[1.5] text-[#6E6C67] sm:max-w-[380px] sm:text-[18px] xl:mt-10 xl:max-w-[420px] xl:text-[21px] xl:tracking-[-0.01em] dark:text-[#94918A]">
            Create a professional digital presence without building a website
            from scratch.
          </p>

          <div className="mt-[26px] flex flex-col gap-[10px] sm:flex-row sm:gap-[14px] xl:mt-11">
            <StartBuildingButton className="h-[54px] w-full rounded-full bg-[#1B62F5] px-[34px] text-[16px] font-semibold text-white hover:bg-[#1450D8] sm:w-auto xl:h-[58px] xl:text-[17px] xl:tracking-[-0.01em]">
              Create your OWNA
            </StartBuildingButton>

            {/* Frosted rather than a flat fill because it sits over bright
                product footage on mobile and over the device's edge on desktop.
                The opaque values are the fallback; the translucent ones only
                apply where backdrop-filter actually exists. */}
            <Button
              variant="ghost"
              className="h-[54px] w-full rounded-full border border-white/72 bg-white px-[30px] text-[16px] font-medium text-[#0C0B0A] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_10px_28px_-12px_rgba(20,18,14,0.42)] hover:bg-white hover:text-[#0C0B0A] supports-[backdrop-filter]:bg-white/58 supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.6] supports-[backdrop-filter]:hover:bg-white/74 supports-[backdrop-filter]:hover:border-white/90 sm:w-auto xl:h-[58px] xl:text-[17px] xl:tracking-[-0.01em] dark:border-[#F8F6F2]/26 dark:bg-[#26251F] dark:text-[#F8F6F2] dark:shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_10px_28px_-10px_rgba(0,0,0,0.55)] dark:hover:bg-[#2E2D27] dark:hover:text-[#F8F6F2] dark:supports-[backdrop-filter]:bg-[#F8F6F2]/10 dark:supports-[backdrop-filter]:hover:bg-[#F8F6F2]/17 dark:supports-[backdrop-filter]:hover:border-[#F8F6F2]/44"
              render={<Link href="#explore" />}
            >
              See real profiles
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
