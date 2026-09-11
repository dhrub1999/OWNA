import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { BLOCK_TYPES } from "@/lib/blocks/definitions";
import { THEME_PRESETS } from "@/lib/themes/presets";

/**
 * Section 7: "Free, for now." — pricing.
 *
 * One row, not a ladder: there is one tier and it costs nothing, so this says
 * that rather than inventing a "Pro" column for a plan nobody has specified.
 * The mono line's counts come from `BLOCK_TYPES` and `THEME_PRESETS` for the
 * same reason the block grid's footer does — a number typed by hand here
 * could drift from what the product actually ships.
 */
export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-border bg-card py-[clamp(56px,6vw,88px)]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-[clamp(16px,4vw,48px)]">
        <div className="min-w-0">
          <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold tracking-[-0.03em]">
            Free, for now.
          </h2>
          <p className="mt-3 max-w-[52ch] text-[17px] leading-[1.55] text-muted-foreground">
            Every block, every theme, your own handle, publish and unpublish as often as you
            want. No card, no trial clock.
          </p>
        </div>

        <div className="flex flex-[1_1_300px] flex-wrap items-center gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            {BLOCK_TYPES.length} blocks · {THEME_PRESETS.length} themes · 1 page · $0
          </p>
          <StartBuildingButton className="h-13 flex-[1_1_200px] justify-center rounded-full px-7 text-base font-semibold">
            Create your OWNA
          </StartBuildingButton>
        </div>
      </div>
    </section>
  );
}
