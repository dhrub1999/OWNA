import { Marquee } from "@/components/magicui/marquee";
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
 * section's CTA carries the click instead — which is also why the whole rail is
 * `aria-hidden`: a Marquee repeats its children to loop seamlessly, and without
 * that a screen reader would hear each profile announced three times over.
 *
 * A slow, continuous auto-scroll rather than a manual snap rail: five is more
 * than fits, and a calm, always-moving rail makes that point on its own,
 * without needing a user to discover they can scroll. `pauseOnHover` gives
 * back manual control the moment someone's cursor lands on it, and the
 * reduced-motion override in `globals.css` freezes the loop entirely for
 * anyone who's asked the OS for less motion.
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
    <div aria-hidden="true" className="-mx-6 sm:-mx-12">
      <Marquee
        pauseOnHover
        repeat={3}
        className="[--duration:70s] [--gap:1.25rem] px-6 py-2 sm:px-12 lg:[--gap:1.5rem]"
      >
        {RAIL.map((entry) => (
          <figure
            key={entry.id}
            // Named group (`group/tile`): Marquee's own outer element is also
            // an (unnamed) `.group`, used for `pauseOnHover`. An unnamed
            // `group-hover:` here would fire off hovering *anywhere* on the
            // rail, lifting every tile at once instead of just this one.
            className="group/tile w-[272px] shrink-0 sm:w-[300px]"
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
            <div className="h-[440px] overflow-hidden rounded-[24px] border border-border bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [mask-image:linear-gradient(to_bottom,#000_78%,transparent_99%)] group-hover/tile:-translate-y-1.5 sm:h-[480px]">
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
      </Marquee>
    </div>
  );
}
