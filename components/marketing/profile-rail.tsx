import { Marquee } from "@/components/magicui/marquee";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { demoProfiles, type DemoProfileId } from "@/lib/demo-profiles";

/**
 * Section 5: "Five real pages, one renderer." — the Explore rail.
 *
 * These are the same five curated personas the onboarding questionnaire seeds
 * from (`lib/demo-profiles.ts`), rendered through the real `ProfileRenderer` —
 * so what a visitor scrolls past here is literally the renderer that serves
 * published pages, not a drawing of one. That is the whole argument the
 * section's own copy makes, and a mockup would undercut it.
 *
 * Nothing links out: these personas are illustrations, not published rows, so
 * a tile that looked clickable would land on a 404. The tiles are inert and
 * `aria-hidden` — `Marquee` repeats its children to loop seamlessly, and
 * without that a screen reader would hear each profile announced twice over.
 */
const RAIL: { id: DemoProfileId; name: string; craft: string; theme: string }[] = [
  {
    id: "photographer",
    name: "Marc Dubois",
    craft: "Editorial photography",
    theme: "Portfolio",
  },
  {
    id: "jewellery",
    name: "AURA",
    craft: "Fine jewellery",
    theme: "Editorial",
  },
  {
    id: "freelancer",
    name: "Alex Chen",
    craft: "Full-stack development",
    theme: "Cyber",
  },
  {
    id: "creative",
    name: "Maya Chandra",
    craft: "Type design",
    theme: "Glass",
  },
  {
    id: "consultant",
    name: "Sarah Jenkins",
    craft: "Growth consulting",
    theme: "Professional",
  },
];

export function ProfileRail() {
  return (
    <section
      id="explore"
      className="scroll-mt-20 overflow-hidden border-t border-border bg-card py-[clamp(64px,8vw,112px)]"
    >
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <h2 className="font-display max-w-[18ch] text-[clamp(27px,4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
            Five real pages, one renderer.
          </h2>
          <p className="max-w-[44ch] text-[clamp(16px,1.5vw,19px)] leading-[1.55] text-muted-foreground">
            These are not screenshots. Every tile below is drawn by the same code that serves
            published pages — which is also why the preview you edit can&rsquo;t drift from what
            a visitor sees.
          </p>
        </div>
      </div>

      {/* The two-copy math the design handoff calls out: each tile is 300px
          plus Marquee's own --gap, and repeat={2} gives it exactly the second
          copy it needs to slide into as the first exits — the loop is one
          full copy-width, not a fraction tuned to the tile count. */}
      <div aria-hidden="true" className="mt-12 px-[clamp(16px,4vw,48px)]">
        <Marquee pauseOnHover repeat={2} className="p-0 [--duration:70s] [--gap:24px]">
          {RAIL.map((entry) => (
            <figure key={entry.id} className="w-[300px] shrink-0">
              <div className="h-[460px] overflow-hidden rounded-[20px] border border-border bg-background [mask-image:linear-gradient(to_bottom,#000_80%,transparent_99%)]">
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer snapshot={demoProfiles[entry.id]} isPreview />
                </div>
              </div>
              <figcaption className="mt-4.5 flex items-baseline justify-between gap-4">
                <span>
                  <span className="block font-medium">{entry.name}</span>
                  <span className="block text-sm text-muted-foreground">{entry.craft}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] tracking-[0.05em] text-muted-foreground uppercase">
                  {entry.theme}
                </span>
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
