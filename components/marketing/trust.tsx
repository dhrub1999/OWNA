import { Globe, Link2, Lock, ShieldCheck } from "lucide-react";

/**
 * Section 6: "Nothing clever is happening to your page." — trust.
 *
 * Four claims, each one checkable against what actually ships rather than a
 * generic trust badge: drafts are private until publish (the publish flow),
 * writes are RLS-scoped to the owner (the database, not the app), embeds
 * resolve through the provider allowlist in `lib/blocks/embeds/providers.ts`
 * rather than an arbitrary iframe, and the handle a visitor sees never
 * changes shape. Nothing here is added on faith — don't add a fifth claim
 * without something in the codebase to point at.
 */
const CLAIMS = [
  {
    icon: Lock,
    title: "Your draft is private until you say otherwise",
    body: "A page is invisible until you publish it, and unpublishing takes it straight back down. As often as you like.",
  },
  {
    icon: ShieldCheck,
    title: "Only you can write to it",
    body: "Every change is made as you, enforced by the database itself. There is no admin key in the product that could edit your page on your behalf.",
  },
  {
    icon: Link2,
    title: "Links and embeds are checked, not trusted",
    body: "A pasted URL is matched against a fixed list of providers before anything renders, so an embed is never arbitrary code on your page.",
  },
  {
    icon: Globe,
    title: "The handle stays the same",
    body: "Publishing swaps the page behind owna.online/yourname in about a second — no rebuild, no new URL. A printed card or a bio link never goes stale.",
  },
] as const;

export function Trust() {
  return (
    <section className="border-t border-border py-[clamp(64px,8vw,112px)]">
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <div className="flex flex-wrap items-start gap-[clamp(32px,4vw,72px)]">
          <div className="min-w-0 flex-[1_1_320px]">
            <h2 className="font-display text-[clamp(27px,4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
              Nothing clever is happening to your page.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[clamp(16px,1.5vw,19px)] leading-[1.55] text-muted-foreground">
              No audience to grow, no algorithm, no analytics you didn&rsquo;t ask for. It is a
              page, at a URL, that you control.
            </p>
            <p className="mt-7 max-w-[44ch] border-l-2 border-border pl-4.5 text-[15px] leading-[1.6] text-muted-foreground">
              Free while OWNA is this young. A paid tier will only arrive for things that
              don&rsquo;t exist yet — more than one page, a domain of your own — and nothing you
              build today gets taken away.
            </p>
          </div>

          <div className="min-w-0 flex-[1_1_420px] divide-y divide-border overflow-hidden rounded-[24px] border border-border bg-card">
            {CLAIMS.map((claim) => (
              <div key={claim.title} className="flex gap-3.5 px-7 py-6">
                <claim.icon
                  aria-hidden="true"
                  strokeWidth={2}
                  className="mt-[3px] size-4.5 shrink-0 text-primary"
                />
                <div>
                  <div className="font-semibold">{claim.title}</div>
                  <p className="mt-1.5 text-[15px] leading-[1.6] text-muted-foreground">
                    {claim.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
