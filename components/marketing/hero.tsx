import { EditorStage } from "@/components/marketing/editor-stage";
import { StartBuildingButton } from "@/components/marketing/start-building-button";

/**
 * The marketing hero.
 *
 * The old hero showed a recording of the product. This one embeds the real
 * editor instead (`EditorStage`) — a visitor can add a block, remove one and
 * swap the theme before they know what OWNA is, which is a stronger argument
 * than a video of someone else doing it.
 */
export function Hero() {
  return (
    <section className="border-b border-border pt-[clamp(48px,7vw,88px)] pb-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <div className="motion-safe:animate-hero-reveal flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-sans max-w-[20ch] text-[clamp(28px,3.4vw,48px)] leading-[1.04] font-extrabold tracking-[-0.035em]">
            Build the page you point people to.
          </h1>
          <div className="flex flex-wrap items-center gap-5">
            <p className="max-w-[34ch] text-base leading-relaxed text-muted-foreground">
              No code, no hosting. An account is only needed to publish.
            </p>
            <StartBuildingButton className="h-12.5 shrink-0 rounded-full px-6.5 text-[15px] font-semibold">
              Create your OWNA
            </StartBuildingButton>
          </div>
        </div>

        <div className="motion-safe:animate-hero-reveal motion-safe:[animation-delay:0.1s] mt-8">
          <EditorStage />
        </div>

        <p className="mt-5 font-mono text-xs tracking-[0.04em] text-muted-foreground">
          ↑ Live. Add a block, swap the theme — this is the editor, not a picture of it.
        </p>
      </div>
    </section>
  );
}
