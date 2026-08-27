import { Check } from "lucide-react";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";

/**
 * Pricing.
 *
 * The nav and the footer both linked to `#pricing`, which did not exist. This
 * is the section, and it says the true thing: there is one tier and it costs
 * nothing. No invented ladder, no greyed-out "Pro" column for a plan nobody has
 * specified — a fake tier is a promise, and this one would be a promise made up
 * by the marketing page rather than by the product.
 *
 * Every line in the list is checkable against the codebase: nine block types in
 * `components/public/blocks/`, ten presets in `lib/themes/presets.ts`, and the
 * publish/unpublish pair the dashboard already ships.
 */
const INCLUDED = [
  {
    label: "Nine kinds of block",
    detail:
      "Hero, links, projects, gallery, text, image, embed, social, divider — as many of each as you want.",
  },
  {
    label: "All ten themes",
    detail:
      "Colour, type and layout, swapped live. Every one of them contrast-checked.",
  },
  {
    label: "Your own handle",
    detail: "owna.app/yourname, yours the moment you claim it.",
  },
  {
    label: "Publish and unpublish",
    detail:
      "Take the page down, put it back, as often as you like. Drafts stay private until you say otherwise.",
  },
  {
    label: "No account to start",
    detail:
      "Build the whole page first. Signing up is what puts it online, not what lets you begin.",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 py-32 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        {/* 5/7, not 6/6: the list is the substance and gets the wider half. */}
        <BlurFade
          inView
          direction="up"
          className="grid gap-16 lg:grid-cols-[5fr_7fr] lg:gap-24"
        >
          <div className="lg:pt-2">
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Free, for now.
            </h2>
            <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-muted-foreground">
              Every block, every theme, your own handle. Nothing sits behind a
              card, and nothing you build today gets taken away later.
            </p>

            <p className="mt-10 max-w-[42ch] border-l-2 border-border pl-5 text-[15px] leading-relaxed text-muted-foreground">
              A paid tier will arrive when there is something worth charging
              for — more than one page, a domain of your own. Until then this is
              the whole product, and the page you make on it stays yours.
            </p>
          </div>

          {/* One surface, divided — not five stacked cards. There's only one
              plan, so the beam is doing the job a "most popular" ribbon does
              on a pricing ladder — pointing at the thing to look at — without
              inventing a ladder to point along. */}
          <div className="relative rounded-[32px] border border-border bg-card">
            <BorderBeam
              duration={8}
              size={140}
              colorFrom="var(--primary)"
              colorTo="var(--logo-hover)"
            />
            <div className="flex flex-wrap items-end justify-between gap-4 px-8 py-8 sm:px-10">
              <div>
                <div className="font-display text-2xl font-bold">
                  Everything OWNA does
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  No card, no trial clock.
                </div>
              </div>
              <div className="font-display text-5xl font-bold tracking-tight">
                Free
              </div>
            </div>

            <ul className="divide-y divide-border border-y border-border">
              {INCLUDED.map((item) => (
                <li
                  key={item.label}
                  className="flex gap-4 px-8 py-6 sm:px-10"
                >
                  <Check
                    aria-hidden
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    strokeWidth={2}
                  />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-8 py-8 sm:px-10">
              <StartBuildingButton className="h-14 w-full rounded-full text-base font-semibold transition-transform active:scale-[0.98] sm:w-auto sm:px-10">
                Create your OWNA
              </StartBuildingButton>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
