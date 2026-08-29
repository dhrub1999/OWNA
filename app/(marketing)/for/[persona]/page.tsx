import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { demoProfiles, type DemoProfileId } from "@/lib/demo-profiles";

/**
 * Persona landing pages — /for/{persona}.
 *
 * These five personas already exist as a real product concept: they're the
 * onboarding questionnaire's "what are you making this for?" options
 * (lib/demo-profiles.ts's PURPOSE_OPTIONS), and each already has a real demo
 * snapshot used on the homepage's "Explore" rail. This promotes that existing
 * content to its own indexable, keyword-targeted URL instead of five personas
 * competing for one homepage slot — no invented copy about capabilities the
 * product doesn't have.
 *
 * The set is small and fixed, so every page is fully static.
 */
const PERSONAS: Record<
  DemoProfileId,
  {
    headline: string;
    subhead: string;
    highlights: { title: string; detail: string }[];
    craft: string;
  }
> = {
  consultant: {
    headline: "A page built for coaches and consultants.",
    subhead:
      "A home for your services and how people book you — one link, worth putting in every bio and email signature.",
    highlights: [
      { title: "Hero", detail: "Your photo, name and the one line that says what you do." },
      { title: "Text", detail: "Explain your approach in your own words, not a form field." },
      { title: "Links", detail: "Buttons to a booking page, a call link, a newsletter — anywhere clients need to go." },
      { title: "Social", detail: "LinkedIn, X, email — every way to reach you in one row." },
    ],
    craft: "Coaching & consulting",
  },
  photographer: {
    headline: "A page built for photographers.",
    subhead:
      "A gallery-first page that puts the work up front, not buried under a bio nobody reads first.",
    highlights: [
      { title: "Gallery", detail: "A grid or masonry layout with a lightbox, for the images to actually breathe." },
      { title: "Hero", detail: "Your name and specialty, above the work, not competing with it." },
      { title: "Social", detail: "Instagram and the rest, for the people who want more." },
      { title: "Links", detail: "A booking link or contact button, without a checkout flow you don't need." },
    ],
    craft: "Photography",
  },
  freelancer: {
    headline: "A page built for freelancers.",
    subhead:
      "Portfolio, projects and a way to get in touch — everything a client needs before the first call.",
    highlights: [
      { title: "Projects", detail: "Cards for the things you've made, each with its own link and tags." },
      { title: "Links", detail: "GitHub, a resume, a Calendly — however people should follow up." },
      { title: "Text", detail: "A short paragraph on what you do and who you do it for." },
      { title: "Social", detail: "The professional profiles that matter, nothing else." },
    ],
    craft: "Freelance & independent work",
  },
  creative: {
    headline: "A page built for artists and makers.",
    subhead:
      "For artists, writers and makers of things — a page that looks like your work, not a template it got poured into.",
    highlights: [
      { title: "Gallery", detail: "Grid, masonry or bento — whichever layout fits the work." },
      { title: "Image", detail: "A single piece given the room to be the only thing on the page." },
      { title: "Text", detail: "An artist statement, in your own voice." },
      { title: "Embed", detail: "A Spotify or YouTube player, if the work is something to hear or watch." },
    ],
    craft: "Creative portfolio",
  },
  jewellery: {
    headline: "A page built for people selling what they make.",
    subhead:
      "Showcase what you make or sell, with a real gallery and a straightforward way to reach you.",
    highlights: [
      { title: "Gallery", detail: "Product shots in a real grid, not squeezed into a link list." },
      { title: "Links", detail: "Point to your shop, a custom-order form, or wherever people actually buy." },
      { title: "Social", detail: "Instagram and Pinterest, where this kind of work already lives." },
      { title: "Hero", detail: "Your name or brand, front and center." },
    ],
    craft: "Selling products",
  },
};

const ORDER: DemoProfileId[] = [
  "consultant",
  "photographer",
  "freelancer",
  "creative",
  "jewellery",
];

export function generateStaticParams() {
  return ORDER.map((persona) => ({ persona }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ persona: string }>;
}): Promise<Metadata> {
  const { persona } = await params;
  const content = PERSONAS[persona as DemoProfileId];
  if (!content) return {};

  return {
    title: content.craft,
    description: content.subhead,
    alternates: { canonical: `/for/${persona}` },
  };
}

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ persona: string }>;
}) {
  const { persona } = await params;
  const content = PERSONAS[persona as DemoProfileId];
  if (!content) notFound();

  const otherPersonas = ORDER.filter((id) => id !== persona);

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-12 sm:py-28">
      <Link
        href="/for"
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft
          aria-hidden
          strokeWidth={2}
          className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5"
        />
        Built for you
      </Link>

      <div className="mt-10 grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <BlurFade direction="up" duration={0.5} offset={10}>
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {content.craft}
          </p>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {content.headline}
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
            {content.subhead}
          </p>

          <div className="mt-10">
            <StartBuildingButton className="h-14 w-full rounded-full text-base font-semibold transition-transform active:scale-[0.98] sm:w-auto sm:px-10">
              Create your OWNA
            </StartBuildingButton>
          </div>

          <ul className="mt-14 space-y-6">
            {content.highlights.map((item) => (
              <li key={item.title} className="flex gap-4">
                <CheckCircle
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  strokeWidth={2}
                />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </BlurFade>

        <BlurFade direction="up" duration={0.5} offset={10} delay={0.1}>
          <div className="h-[520px] overflow-hidden rounded-[24px] border border-border bg-background sm:h-[600px] [mask-image:linear-gradient(to_bottom,#000_88%,transparent_99%)]">
            <div className="pointer-events-none h-full overflow-hidden">
              <ProfileRenderer snapshot={demoProfiles[persona as DemoProfileId]} isPreview />
            </div>
          </div>
        </BlurFade>
      </div>

      <div className="mt-24 border-t border-border pt-12">
        <p className="text-sm text-muted-foreground">Also built for</p>
        <ul className="mt-5 flex flex-wrap gap-3">
          {otherPersonas.map((id) => (
            <li key={id}>
              <Link
                href={`/for/${id}`}
                className="inline-flex rounded-full border border-border bg-background px-4 py-1.5 text-sm transition-colors hover:border-foreground/30 hover:bg-secondary"
              >
                {PERSONAS[id].craft}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
