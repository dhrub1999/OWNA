import { StartBuildingButton } from "@/components/marketing/start-building-button";

/**
 * Section 9: the closing CTA.
 *
 * The one panel on the page that inverts against its surroundings rather
 * than following the theme — black on the cream page in light mode, cream on
 * the black page in dark mode — via the `--ow-invert-*` tokens in
 * globals.css. That's deliberate: it's the one moment the page is meant to
 * read as a hard stop before the footer, not a continuation of the section
 * above it, which is also why it carries no top border unlike every other
 * section here.
 */
export function ClosingCta() {
  return (
    <section className="bg-[var(--ow-invert-bg)] text-center text-[var(--ow-invert-ink)]">
      <div className="mx-auto max-w-[900px] px-[clamp(16px,4vw,48px)] py-[clamp(72px,10vw,152px)]">
        <h2 className="font-display text-[clamp(32px,6vw,80px)] leading-[1.05] font-extrabold tracking-[-0.035em]">
          Own your corner
          <br />
          of the internet.
        </h2>
        <p className="mt-6 text-[clamp(17px,2vw,22px)] text-[var(--ow-invert-muted)]">
          Build the page first. Decide about the account later.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <StartBuildingButton className="h-14 rounded-full px-[clamp(24px,5vw,34px)] text-[17px] font-semibold">
            Create your OWNA
          </StartBuildingButton>
          <p className="font-mono text-[13px] text-[var(--ow-invert-faint)]">
            owna.online/yourname
          </p>
        </div>
      </div>
    </section>
  );
}
