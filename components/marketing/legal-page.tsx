import type { ReactNode } from "react";

/**
 * Layout for the legal pages.
 *
 * Asymmetric on purpose: the contents rail is sticky on the left and the prose
 * runs in a measured column on the right, so a long document stays navigable
 * without a centred wall of text. Below `lg` the rail collapses out entirely
 * rather than becoming a stack of links nobody scrolls past — the headings
 * themselves are the navigation at that width.
 *
 * `top-28` on the rail clears the sticky 5rem header plus a little air.
 */
export type LegalSection = {
  id: string;
  heading: string;
  body: ReactNode;
};

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-12 sm:py-28">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-24">
        <div>
          <div className="lg:sticky lg:top-28">
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              Updated {updated}
            </p>
            <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {title}
            </h1>

            <nav aria-label="On this page" className="mt-10 hidden lg:block">
              <ul className="space-y-3 border-l border-border">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-0.5 pl-5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div>
          <div className="max-w-[65ch] text-lg leading-relaxed text-muted-foreground">
            {intro}
          </div>

          <div className="mt-16 space-y-14">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  {section.heading}
                </h2>
                <div className="mt-4 max-w-[65ch] space-y-4 leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
