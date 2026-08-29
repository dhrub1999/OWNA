# OWNA — marketing brief

Source-of-truth for anyone designing ads, flyers, one-pagers, social posts or
video for OWNA. Every claim below is checkable against the product as it
exists today (`README.md`, `context.md`) — nothing here is aspirational
copy for a feature that doesn't ship yet. If a future feature changes this,
update this file in the same PR.

---

## 1. What the product is

**OWNA is a customizable digital profile platform.** Every user gets
`owna.online/{username}` — one page, built from drag-and-drop content blocks
and a theme they control, with no code, no hosting, and no deploys.

In one sentence: **it's the page you put in your bio, built from real
building blocks instead of a stack of links.**

**How it works, in three steps:**
1. Answer a couple of quick questions about what the page is for — the
   builder starts you with a relevant layout instead of a blank canvas.
2. Drag blocks onto the page — hero, gallery, projects, links, text, image,
   embed, social icons, divider — and pick from ten themes. Edits autosave.
3. Publish. The page goes live at `owna.online/yourname` instantly — no
   rebuild, no waiting.

**The one feature that does the most marketing work by itself:** you can
build the *entire* page — every block, every theme — before creating an
account. Signing up is only required to publish. That means a demo, an ad,
or a landing page can say "try it, no signup" and mean it literally.

---

## 2. What it's not — the category and the wedge

OWNA competes with **link-in-bio tools** (Linktree and its clones), and the
entire positioning is the gap between "a list of links" and "a real page."

- A link-in-bio tool gives you one block: a stack of buttons.
- OWNA gives you **nine**: hero (photo, name, bio, availability, location),
  text, gallery, projects (case studies with image galleries), image, links,
  embeds (YouTube/Spotify/etc. by URL), social icons (13 platforms, email
  included), and dividers.

Approved tagline material, pulled directly from the shipped homepage copy:

> "You are more than a list of links."
> "A link-in-bio tool gives you one of them. OWNA gives you nine."

This is the single sharpest creative hook available: **an 8-cell grid of
what a page can be, versus 1 dead, dashed-outline cell labeled "Links" —
that's what Linktree gives you.** That visual (already built into the
homepage as `BlockGrid`) is a strong template for a comparison ad or a
static social post.

---

## 3. Target market

OWNA is for **individuals who need one credible, personal page to point
people to** — not businesses needing a multi-page website, and not people
who only need a stack of links. Five personas are already built into the
product (the onboarding questionnaire, five `/for/{persona}` landing pages,
and five real demo profiles), so these are not hypothetical — they're the
actual target segments:

| Persona | Who they are | What they need the page to do |
|---|---|---|
| **Coaches & consultants** | Independent coaches, consultants, advisors | One link for every bio and email signature — services, approach, and how to book, in their own words |
| **Photographers** | Working and hobbyist photographers | A gallery-first page where the work leads, not a bio field crammed above it |
| **Freelancers & independents** | Devs, designers, writers, any solo operator | Portfolio, project case studies, and a way to get in touch — everything a client needs before the first call |
| **Artists & makers** | Visual artists, writers, craftspeople | A page that looks like the work, not a template it got poured into — gallery, artist statement, embedded audio/video |
| **People selling what they make** | Jewellery makers, small-batch product sellers, Etsy-style sellers | Real product-shot gallery plus a link to the shop or a custom-order form — not a link list |

**The unifying trait across all five:** one person, a body of work or a
service, and a need to look credible in a single link — in a bio, an email
signature, a business card, a QR code on a print piece. Nobody in this
target market needs a multi-page marketing site or a CMS; they need a
polished single page they can stand up in minutes and control themselves.

**Explicitly not the target (for now):** teams, agencies needing multiple
pages/domains, e-commerce checkout flows, businesses needing a full
marketing site. The product is one page per person — a paid tier "for more
than one page, a domain of your own" is acknowledged as future, not current.

---

## 4. Why it helps them / the core benefits

Translate features into the benefit for the target personas above:

- **Looks credible instantly, no design skill required.** Ten
  contrast-checked themes and nine real content blocks mean the page looks
  considered, not thrown together — without touching CSS or hiring a
  designer.
- **Says more than a link list can.** A gallery block shows the work. A
  projects block tells the story behind it. A hero block carries
  availability and location, not just a name. This is the "more than a list
  of links" wedge — it's the whole reason to switch from a bio-link tool.
  See §2.
- **Zero risk to try.** The whole page can be built — every block, every
  theme — before creating an account. There's no signup wall between
  curiosity and seeing your own page built. This is a genuine differentiator
  to lead with in any acquisition-focused ad ("try it before you sign up").
  See §1.
- **One handle, always current.** `owna.online/yourname` — put it in a bio,
  a signature, a QR code, a business card, once. Publishing updates the same
  URL instantly (cache invalidation, not a redeploy), so it never needs to
  be reprinted or reshared.
- **Free, with everything included.** Every block, every theme, publish and
  unpublish as often as wanted. No feature sits behind a paywall today —
  useful in messaging as "no card, no trial clock," but don't invent a
  pricing ladder or a "Pro" tier that doesn't exist. See §6.
- **Built for exactly one job.** Because it isn't a general website builder,
  there's no clutter — no page tree, no plugin marketplace, no hosting
  config. Answer a few questions, build one page, publish it.

---

## 5. Brand voice and visual system (for consistency across assets)

Pulled directly from the shipped marketing site — reuse this rather than
inventing a new voice per asset.

**Voice:** Plain, confident, slightly understated. Short declarative
sentences. No hype adjectives ("revolutionary," "game-changing"). No
invented urgency. Says exactly what's true and stops — e.g. "Free, for now,"
not "Free forever!!" The copy trusts the reader to notice the product is
good rather than telling them to be impressed.

**Headline pattern in use:** *"Your online presence should feel like you."*
— identity/authenticity framing, not productivity or growth-hacking framing.
This product is not selling "grow your audience" or "monetize your links" —
it's selling **a page that actually represents you**, however you make a
living.

**Palette:** Warm off-white (`#F7F5F1`) / near-black (`#0C0B0A`) as the base
in light mode, inverted in dark mode. Cobalt blue (`#1B62F5`) is the one
marketing accent color — reserved for the primary CTA only. Lime green
(`#B8F03C`) is *not* a marketing color — it belongs to the product footage
itself (a themed profile) and should not be used as chrome. **Rule for any
new asset: pick one accent color for the CTA and don't let a second color
compete with it.**

**Primary CTA copy:** "Create your OWNA." Secondary CTA: "See real
profiles." Reuse these verbatim rather than inventing new button copy per
asset — consistency across an ad and the landing page it points to matters
more than variety.

**Visual motif:** a real phone/device frame showing a real profile being
built or scrolled — never a stock photo of an unrelated person or a generic
abstract graphic. The product's built-in demo profiles (consultant,
photographer, freelancer, creative, jewellery — see §3) are the correct
source of "real profile" screenshots for any asset; they already exist as
polished, on-brand examples for each target persona.

---

## 6. Facts and guardrails for anyone writing copy

Use this section to avoid promising something the product doesn't do.

- **Pricing:** one free tier, currently the entire product. No paid tier
  exists yet. Do not invent tier names, feature-gating, or pricing numbers.
  If a paid tier needs to be mentioned, the only honest framing is "a paid
  tier is coming for things like multiple pages or a custom domain" — never
  present that as available now.
- **Nine blocks, ten themes** — exact, stable numbers pulled live from the
  codebase (`lib/blocks/definitions.ts`, `lib/themes/presets.ts`). If either
  count ever changes, this document and any asset using the number needs
  updating.
- **No signup required to build; signup is required to publish.** Never say
  "no signup required" without that distinction — it's the guest-build /
  publish-gated flow, not a fully accountless product.
- **One page per user, one handle.** Don't market multi-page sites, custom
  domains, or team/agency features — none of that exists yet.
- **13 social platforms supported**, email included as one of the 13 (not
  "13 platforms plus email").
- **The five personas are the target market, not a random example list** —
  any "who's it for" messaging should draw from consultants/coaches,
  photographers, freelancers/independents, artists/makers, and product
  sellers (jewellery-style) rather than invented segments like "students" or
  "influencers," which aren't built into the product's own onboarding.
