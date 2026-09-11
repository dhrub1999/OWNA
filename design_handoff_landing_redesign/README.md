# Handoff: OWNA landing page redesign

## Overview

A redesign of the OWNA marketing landing page (`app/(marketing)/page.tsx` and the components under `components/marketing/`). The central change is that the product itself carries the argument: the hero embeds a **live, working block editor** — a visitor can add blocks, remove blocks and swap themes before they know what OWNA is — and a rail further down renders five real demo profiles through the same theme renderer that serves published pages.

The page argues three things in order: *you can build it right now* (live editor), *this is more than a link list* (nine blocks, five real pages), *nothing clever happens to your page* (trust, then price, then FAQ).

## About the design files

The files in this bundle are **design references written in HTML**. They are prototypes of the intended look and behaviour — not production code to lift.

The task is to **recreate these designs inside the existing OWNA codebase**: Next.js App Router, React 19, Tailwind CSS v4 with the token layer in `app/globals.css`, and the shadcn-style primitives in `components/ui/`. Everything here should end up as Tailwind classes on real components in `components/marketing/`, using the repo's existing `--background` / `--foreground` / `--border` / `--muted-foreground` / `--primary` tokens and the `dark` variant — not as inline styles or a parallel token set.

Two files are included for comparison:

- `OWNA Landing.dc.html` — **the redesign. This is what to build.**
- `OWNA Landing (current).dc.html` — a faithful recreation of the current live page, for diffing intent. Not a target.

The prototypes use inline styles and a small `{{ }}` template runtime (`support.js`) purely because that is how the design tool renders. Ignore both; read them for values and structure.

## Fidelity

**High fidelity.** Colours, type, spacing, radii, motion and copy are final. Recreate pixel-for-pixel using the repo's Tailwind tokens and utilities. Where a value below matches an existing token in `app/globals.css`, use the token rather than an arbitrary value.

## Design tokens

The prototype defines its own `--ow-*` layer only because it runs outside the app. **Map it onto the repo's existing tokens** — they already hold the same values:

| Prototype | Repo token | Light | Dark |
| --- | --- | --- | --- |
| `--ow-bg` | `--background` | `#F7F6F2` | `#0D0D0D` |
| `--ow-surface` | `--card` | `#FFFFFF` | `#151515` |
| `--ow-ink` | `--foreground` | `#111111` | `#F5F4EF` |
| `--ow-muted` | `--muted-foreground` | `#6B6B67` | `#A5A49F` |
| `--ow-line` | `--border` | `#E4E2DC` | `#292929` |
| `--ow-accent` | `--primary` | `#0055FF` | `#0055FF` |

Values with no existing token (add them, or express inline):

| Name | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--ow-line-soft` | `rgba(228,226,220,0.4)` | `rgba(41,41,41,0.55)` | sticky header bottom border |
| `--ow-header` | `rgba(247,246,242,0.72)` | `rgba(13,13,13,0.72)` | sticky header fill under `backdrop-filter` |
| `--ow-faint` | `#C6C3BB` | `#454542` | drag-grip and lock icons in the editor sidebar |
| `--ow-accent-soft` | `rgba(0,85,255,0.07)` | `rgba(0,85,255,0.2)` | selected chip / selected persona fill |
| `--ow-shadow` | `rgba(17,17,17,0.25)` | `rgba(0,0,0,0.7)` | editor stage drop shadow |
| `--ow-invert-bg` | `#111111` | `#F5F4EF` | the closing CTA panel |
| `--ow-invert-ink` | `#F7F6F2` | `#111111` | text on that panel |
| `--ow-invert-muted` | `rgba(247,246,242,0.7)` | `rgba(17,17,17,0.74)` | subhead on that panel |
| `--ow-invert-faint` | `rgba(247,246,242,0.55)` | `rgba(17,17,17,0.64)` | mono URL on that panel |

The closing CTA panel **inverts in both directions**: a black panel on the cream page in light mode, a cream panel on the black page in dark mode. That is deliberate — it is the one place on the page that flips against its surroundings.

### Typography

- Headings: **Plus Jakarta Sans** (600–800) — the repo's `font-heading`.
- Body and the two hero headlines: **Parkinsans** variable (`assets/fonts/parkinsans-variable.woff2`, weights 300–800) — the repo's `font-sans`.
- Mono accents (URLs, counters, `9 blocks · 10 themes · 1 page · $0`): `ui-monospace, monospace`, 10–13px, `letter-spacing: 0.04em`, often uppercase.
- Headline tracking: `-0.035em` to `-0.038em`. Body line-height `1.5`–`1.65`. `text-wrap: balance` on the big headings, `pretty` on paragraphs.

### Scale

- Section vertical rhythm: `clamp(64px, 8vw, 112px)`; horizontal gutter: `clamp(16px, 4vw, 48px)`.
- Content max width: `1280px`, centred.
- Radii: cards `24px`, previews/tiles `20px`, persona buttons `14px`, editor chips/buttons `6–8px`, pills `999px`.
- Buttons: header `38px` tall / `0 22px`; primary in-page `52–56px` tall / `0 26–34px`.
- Section dividers are `1px solid var(--border)` at the top of each `<section>` — no shadows between sections.

## Screens / views

One page. Sections in DOM order.

### 1. Sticky header

Purpose: navigate, switch theme, sign up.

- `position: sticky; top: 0; z-index: 40`, `72px` tall, `border-bottom: 1px solid var(--ow-line-soft)`, fill `var(--ow-header)` with `backdrop-filter: blur(16px) saturate(1.5)`. Keep the repo's existing progressive pattern (`supports-backdrop-filter:`) so the header never becomes unreadable without blur.
- Left: OWNA logo (30px tall, `currentColor`), then nav — Product / Explore / Pricing / FAQ, 14px/500, in-page anchors, `hover:text-primary`.
- Right: **theme toggle**, "Log in" (14px/500), "Create your OWNA" pill (`#0055FF`, white, 14px/600).
- Theme toggle: 36px circle, `1px solid var(--border)`, `background: var(--card)`, 16px icon — moon in light mode, sun in dark. The repo already has `components/theme-toggle.tsx`; use it and drop the prototype's hand-rolled button.
- Responsive: nav hides below **880px**; "Log in" hides below **480px** and the CTA drops to `0 16px` padding.

### 2. Hero — three layouts, one editor

The prototype ships three hero arrangements behind a `heroLayout` prop. **Build `canvas`** — it is the chosen direction; the other two are in the file for reference only.

**`canvas` (build this):** a single row, `align-items: flex-end`, `justify-content: space-between`, wrapping:
- Left: `h1` "Build the page you point people to." — `max-width: 20ch`, `clamp(28px, 3.4vw, 48px)`, weight 800, `line-height: 1.04`, tracking `-0.035em`.
- Right: paragraph "No code, no hosting. An account is only needed to publish." (`max-width: 34ch`, 16px, muted) beside a 50px "Create your OWNA" pill.
- Below, `margin-top: 32px`: the editor stage, full width.
- Under the stage, a 12px mono line: "↑ Live. Add a block, swap the theme — this is the editor, not a picture of it."

Entrance motion: `rise` — `opacity 0→1`, `translateY(10px)→0`, `blur(6px)→0`, `0.6s cubic-bezier(0.25,1,0.5,1)`, stage delayed `0.1s`. Respect `prefers-reduced-motion`.

**The editor stage (`EditorStage.dc.html`) is the most important component on the page.** It is a real editor, not a screenshot:

- Shell: `border-radius: 20px`, `1px solid var(--border)`, `background: var(--card)`, `box-shadow: 0 1px 2px rgba(17,17,17,0.04), 0 24px 60px -28px var(--ow-shadow)`.
- Toolbar (`min-height: 52px`, wraps): logo 18px · centred desktop/mobile segmented control (`background: var(--background)`, 2px padding, 6px radius, active button on `var(--card)`) · "Saved" status with a check · a `Publish` chip (`#0055FF`, white, 32px, 6px radius). "Saved" hides below 760px.
- Left sidebar, `flex: 0 1 208px`, `border-right: 1px solid var(--border)`, scrolls, `max-height: 560px`:
  - **"Your page"** — the current block list. Each row: 14px drag-grip in `var(--ow-faint)`, 12px label, and a `×` remove button. **The hero row is not removable**: it renders an 11px padlock in `var(--ow-faint)` with the title "The hero always stays", and `remove()` refuses `type === "hero"` defensively. Every other block can go.
  - **Palette**, grouped "You" / "Content" / "Media" / "Layout": 2-column grid of 6px-radius outline buttons, 14px icon + 12px label, each with a `title` describing the block. The "Hero" tile sits in "You" at `opacity: 0.5` with the title "You already have a hero".
- Canvas column, `flex: 1 1 300px`: viewport `460px` tall, `background: var(--background)`, `padding: 20px`, `overflow-y: auto`, `align-items: flex-start`. Inside, the paper: `max-width: 620px` (desktop) or `390px` (mobile), `border-radius: 12px`, `1px solid var(--border)`, transitioning `max-width 260ms cubic-bezier(0.16,1,0.3,1)`. The profile itself is drawn by the real theme renderer.
- **Adding a block scrolls the canvas to the new block**: after the state update, the viewport tweens `scrollTop` to `scrollHeight - clientHeight` over `340ms` with an ease-out cubic. Do not rely on `scrollTo({behavior:"smooth"})` — animate it, or use the app's own scroll helper.
- Theme strip under the canvas: "THEME" label, "10 presets" mono counter, then ten chips — each an 18px swatch (preset background, preset border, 7px accent dot) plus the preset name. Selected chip: `1px solid #0055FF`, `background: var(--ow-accent-soft)`.
- Responsive: below **760px** the sidebar goes full width with `max-height: 260px` and a bottom border instead of a right border, and the canvas viewport drops to `380px` tall with `14px` padding.

### 3. "Start from where you actually are." — persona picker

- Heading `clamp(27px, 4vw, 52px)` + paragraph, `max-width: 860px`. Section background `var(--card)`.
- Left column (`flex: 1 1 320px`): label "WHAT IS THIS PAGE FOR?" (11px/600, `0.06em`, uppercase, muted) over five stacked options from `PURPOSE_OPTIONS` — 14px radius, 16px/18px padding, 16px/600 label + 14px muted description. Selected: `1px solid #0055FF`, `background: var(--ow-accent-soft)`, `transition: background-color 200ms, border-color 200ms`. Then a note behind a 2px left rule: "Five starting points, five themes…"
- Right column (`flex: 1 1 420px`): `owna.online/<username>` and "<THEME> THEME" in mono above a live profile render — `height: clamp(400px, 92vw, 560px)`, 20px radius, `mask-image: linear-gradient(to bottom, #000 82%, transparent 99%)`.
- The preview **measures its container** and renders at `clamp(260, containerWidth - 24, 460)` px of content width. Do not hard-code 460.

### 4. "Nine blocks. A link list gives you one." — block grid

Wrapping flex, `gap: 16px`, cards `24px` radius on `var(--card)`:

- Hero card `flex: 3 1 520px`, text side `flex: 1 1 240px`, image `width: min(280px, 100%)` at `aspect-ratio: 922/1206`.
- Seven cards at `flex: 1 1 260px`: 20px/700 title, 15px muted body, image pinned to the bottom at `aspect-ratio: 16/9`.
- Divider card `flex: 1 1 100%`: label block plus a 1px rule filling the rest.
- Footer row: "Use what you need, leave out the rest…" opposite `9 blocks / 10 themes / 1 page` in mono, over a 1px top border.

Card imagery: `assets/products/*.jpg` (hero, gallery, projects, links, social-links, embed, text, image). Every image has descriptive alt text — carry it across verbatim.

### 5. "Five real pages, one renderer." — profile rail

- Heading opposite a paragraph that makes the technical point: these are drawn by the same renderer that serves published pages.
- An infinite marquee, `aria-hidden`, `animation: rail 70s linear infinite` translating `0 → -50%`. The list is duplicated once; each tile is **exactly 324px** (300px + 24px right margin) so five tiles = 1620px = one clean cycle. Keep those numbers in step if tiles change.
- Tile: 460px-tall live profile render, 20px radius, same bottom mask; caption below with name (500) over craft (14px muted), and the theme name in 11px uppercase mono at the right.

### 6. "Nothing clever is happening to your page." — trust

Left column: heading, paragraph, and a note behind a 2px left rule about the free tier. Right column (`flex: 1 1 420px`): a card of four rows separated by 1px borders, each an 18px `#0055FF` stroked icon beside a 600-weight line and a 15px muted paragraph — private drafts / row-level write ownership / provider-allowlisted embeds / stable handle. These claims map to what actually ships; don't add any.

### 7. "Free, for now." — pricing

One row on `var(--card)`, `clamp(56px, 6vw, 88px)` vertical padding: heading `clamp(28px, 3vw, 40px)` + 17px paragraph on the left; on the right a mono `9 blocks · 10 themes · 1 page · $0` beside a 52px CTA. The right group is `flex: 1 1 300px` and the CTA `flex: 1 1 200px`, centred, so both wrap cleanly on a phone.

### 8. "Straight answers." — FAQ

Heading `flex: 1 1 260px` beside an accordion `flex: 2 1 480px`. Rows are 1px-separated; the trigger is a full-width button, 18px/600, 22px vertical padding, with a chevron. **Single-open accordion**, first row open by default; clicking the open row closes it. Answers are 16px/1.65 muted, `max-width: 68ch`.

### 9. Closing CTA

Full-bleed inverted panel (see `--ow-invert-*`), centred, `clamp(72px, 10vw, 152px)` padding. `h2` "Own your corner<br>of the internet." at `clamp(32px, 6vw, 80px)`/800, subhead `clamp(17px, 2vw, 22px)`, then a 56px `#0055FF` CTA beside `owna.online/yourname` in mono.

### 10. Footer

`clamp(48px, 7vw, 72px)` padding, 1px top border. Brand column (`flex: 1 1 240px`) with a 36px logo and "Own your corner of the Internet"; then a **nested row** (`flex: 2 1 300px`) holding three link columns at `flex: 1 1 108px` — Product / Account / Legal — so they stay side by side instead of going ragged as they wrap. Bottom bar over a 1px border: "OWNA © 2026" opposite Privacy / Terms.

## Interactions & behaviour

| Interaction | Behaviour |
| --- | --- |
| Add block | Appends to the page, renders through the real renderer, canvas tweens to the bottom (340ms ease-out cubic) |
| Remove block | Drops the block; **the hero cannot be removed** (lock icon, guarded in the handler) |
| Desktop / mobile | Paper `max-width` 620 ↔ 390, `260ms cubic-bezier(0.16,1,0.3,1)`; content re-renders at the new width |
| Theme chip | Re-renders the profile with the chosen preset immediately |
| Persona option | Swaps the previewed profile, its URL and its theme label |
| Theme toggle | Toggles `.dark` on `<html>`, persists to `localStorage.theme` |
| FAQ row | Single-open accordion; clicking the open row collapses it |
| Profile rail | 70s linear infinite marquee, `aria-hidden`, paused under `prefers-reduced-motion` |
| Entrance | `rise` on hero copy and stage only; nothing else animates in on scroll |

Nav links are in-page anchors. All CTAs point at signup. Hover: links go to `--primary`; the logo uses the repo's `--logo-hover`.

## State management

Landing page: `dark` (seeded from `localStorage.theme`, else `prefers-color-scheme`, overridable by a `defaultTheme` prop of `system | light | dark`), `persona` (selected persona id), `previewW` (measured preview width, from a resize listener), `faq` (index of the open row, `-1` for none). In the app, theme is already owned by `next-themes` via `components/theme-toggle.tsx` — use that and drop the local `dark` state.

Editor stage: `order` (array of `{key, type}`), `preset` (theme preset id), `device` (`desktop | mobile`), `seq` (key counter). Starting blocks default to `["hero", "gallery"]`.

No data fetching. The demo profiles and presets are static — in the repo they come from `lib/themes/presets.ts` and `lib/demo.ts`, which the prototype's `owna-profiles.js` mirrors. **Use the real modules; delete the mirror.**

## Responsive behaviour

Two real breakpoints plus fluid type and wrapping everywhere else:

- **880px** — header nav hides.
- **760px** — editor stage stacks (sidebar full width above a shorter canvas, "Saved" hidden).
- **480px** — header "Log in" hides, CTA padding tightens.
- Everything else is `flex-wrap` + `flex-basis` + `clamp()`; there are no fixed widths outside the marquee tiles. Verify at 390px, 768px, 1024px and 1440px.

## Assets

| Asset | Where it came from |
| --- | --- |
| `assets/fonts/parkinsans-variable.woff2` | The repo's existing Parkinsans face — already loaded in the app |
| `assets/products/*.jpg` (8) | Block screenshots from the current site |
| `assets/logo/*.svg`, `assets/hero-section/poster-frame.jpg` | Existing brand assets; used by the "current" recreation |
| Profile avatars | `i.pravatar.cc` placeholders in the demo data — the repo's own demo avatars should be used instead |

The OWNA wordmark is inlined as SVG paths in both HTML files. Use `components/logo.tsx`.

## Files

| File | What it is |
| --- | --- |
| `OWNA Landing.dc.html` | **The redesign — the target.** All nine sections, the token layer, the media queries and the page logic |
| `EditorStage.dc.html` | The live editor embedded in the hero: toolbar, sidebar, palette, canvas, theme strip |
| `owna-profiles.js` | A standalone mirror of the theme presets, demo profiles and the profile renderer, so the prototypes can render real pages. **Reference only** — the repo has the real thing |
| `OWNA Landing (current).dc.html` | Recreation of the current live page, for comparison |
| `support.js` | The design tool's template runtime. Not part of the design |
| `assets/` | Fonts, block screenshots, logos |
| `screenshots/` | Reference captures of each section (see below) |

### Screenshots

Captured at ~920px wide, so the header nav is visible and the editor stage is in its side-by-side layout. They show intent — the HTML files are the source of truth for exact values.

| File | Section |
| --- | --- |
| `01-hero-light.png` | Header + canvas hero with the live editor |
| `02-persona-picker.png` | "Start from where you actually are." |
| `03-block-grid.png` | "Nine blocks. A link list gives you one." |
| `04-profile-rail.png` | "Five real pages, one renderer." |
| `05-trust.png` | "Nothing clever is happening to your page." |
| `06-pricing.png` | "Free, for now." |
| `07-faq.png` | "Straight answers." |
| `08-closing-cta-footer.png` | Closing CTA panel + footer |
| `09-hero-dark.png` | Hero in dark mode |
| `10-block-grid-dark.png` | Block grid in dark mode |
| `11-closing-cta-footer-dark.png` | Closing CTA inverted the other way + footer, dark mode |

Profile avatars render blank in the captures (the `i.pravatar.cc` placeholders don't survive the capture). They are present when the HTML runs.

To view a prototype, open the `.dc.html` file directly in a browser — no build step.
