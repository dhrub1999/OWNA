import { ProfileRenderer } from "@/components/public/profile-renderer";
import { demoProfiles, type DemoProfileId } from "@/lib/demo-profiles";

/**
 * The Explore rail.
 *
 * These are the same five curated personas the onboarding questionnaire seeds
 * from (`lib/demo-profiles.ts`), rendered through the real `ProfileRenderer` —
 * so what a visitor scrolls past here is literally the renderer that serves
 * published pages, not a drawing of one. That is the whole argument the section
 * is making, and a mockup would undercut it.
 *
 * Nothing links out: these personas are illustrations, not published rows, so a
 * tile that looked clickable would land on a 404. The tiles are inert and the
 * section's CTA carries the click instead.
 *
 * A snap rail rather than a grid: five is more than fits, and "there are more
 * than you can see at once" is the point of an explore section. Native overflow
 * scrolling means touch, trackpad and shift-wheel all work with no JS, and the
 * labelled `tabIndex` makes the overflow keyboard-reachable, which a plain
 * `overflow-x-auto` div is not.
 */
const RAIL: { id: DemoProfileId; name: string; craft: string; theme: string }[] =
  [
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
    <div
      role="region"
      aria-label="Example OWNA profiles"
      tabIndex={0}
      className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:-mx-12 sm:px-12 lg:gap-6 scroll-pl-6 sm:scroll-pl-12"
    >
      {RAIL.map((entry) => (
        <figure
          key={entry.id}
          className="group w-[272px] shrink-0 snap-start sm:w-[300px]"
        >
          {/* The border and the scale nudge live on the frame, never on the
              rendered profile — the profile inside owns its own theme and must
              not inherit marketing chrome.

              The mask is what stops a fixed-height window from guillotining a
              button or a line of text at the bottom edge: the whole frame,
              border included, dissolves instead. A colour fade cannot do this
              job here — these five profiles have five different backgrounds,
              from cream to near-black to violet, and any one colour would be a
              smear on the other four. */}
          <div className="h-[440px] overflow-hidden rounded-[24px] border border-border bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [mask-image:linear-gradient(to_bottom,#000_78%,transparent_99%)] group-hover:-translate-y-1.5 sm:h-[480px]">
            <div className="pointer-events-none h-full overflow-hidden">
              <ProfileRenderer snapshot={demoProfiles[entry.id]} isPreview />
            </div>
          </div>

          {/* Gallery-style: the caption sits outside the frame so the frame
              contains nothing but the artwork. */}
          <figcaption className="mt-5 flex items-baseline justify-between gap-4">
            <span>
              <span className="block font-medium">{entry.name}</span>
              <span className="block text-sm text-muted-foreground">
                {entry.craft}
              </span>
            </span>
            <span className="shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground/70 uppercase">
              {entry.theme}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
