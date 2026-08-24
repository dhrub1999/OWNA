# Handoff: Hero redesign — off-axis, product footage as centerpiece

## Overview

Replacement for the current OWNA marketing hero. The existing hero uses three rotated, overlapping abstract "profile card" mockups that occlude each other's text and misrepresent the product (the real product output is a long, scrolling vertical profile, not a business card). This redesign replaces that collage with a single realistic phone playing a real published profile, positioned off-axis so it bleeds past the bottom of the fold, with the headline running over its left edge.

Three things the design adds beyond the visual change:

1. **A live URL chip** (`owna.online/mayatanaka`) — the product's core promise is "one beautiful link you can send to people," and the current hero contains no link.
2. **Colour attribution** — cobalt (`#1B62F5`) is reserved for marketing chrome (primary CTA); the lime accent belongs to the *user's* profile and appears only inside the device. This silently communicates that profiles are themeable.
3. **A frosted-glass secondary CTA** so "See real profiles" survives sitting over bright product imagery in both modes.

Headline and subhead copy are unchanged from the live site and must stay verbatim.

## About the design files

The files in this bundle are **design references created in HTML** — a prototype showing intended look and behaviour, not production code to copy directly. `OWNA Hero Redesign.dc.html` is authored in a proprietary streaming-component format with inline styles only; do not try to port it literally.

The task is to **recreate this design in the repo's existing environment** using its established patterns — its component conventions, its styling solution (Tailwind / CSS modules / styled-components / whatever is already there), its font loading, its image and video pipeline. Read the values in this README as the source of truth and express them the way the codebase already expresses values.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, and motion. Every number below is measured from the prototype. Recreate it precisely, but map the tokens onto the repo's existing scale where one exists — if the codebase already has a `--bg-primary` that equals `#0C0B0A`, use it rather than hard-coding.

## Screens / Views

### 1. Desktop hero (reference frame 1240 × 820)

The prototype frame is 1240 × 820 because it is a *fold* mock, not a page. In the real page this is a section that fills the viewport width, with the content constrained by the site's existing max-width container. The 820px height corresponds to "hero occupies roughly the first viewport" — do not hard-code it; let content and padding determine height, with the device deliberately overflowing the bottom.

**Layout** — a positioned composition, not a grid. Two absolutely-positioned children over a full-width section with `overflow: hidden`:

| Element | Position (relative to the 1240×820 frame) |
|---|---|
| Copy block | `left: 80px; top: 176px; width: 840px; z-index: 2` |
| Phone | `right: 72px; top: 132px; width: 384px; height: 760px` |
| Lime glow (dark mode only) | `right: 40px; top: 180px; 760 × 760px` |

The phone's `height: 760` against `top: 132` inside an 820 frame means the bottom 72px of the device is clipped by the section edge. **That clip is the design** — the device must be cut off by the fold, not fit inside it. In the real implementation, anchor the device to overflow the section's bottom boundary rather than reproducing the literal 72px.

The copy block is 840px wide and the phone's left edge sits at x≈784, so the widest headline line crosses onto the phone's bezel by roughly 25px. The headline sits above the device (`z-index: 2`).

#### Components

**Headline** — content, verbatim, three explicit lines (do not let it wrap naturally):
```
Your online presence
should feel
like you.
```
- Font: Plus Jakarta Sans, weight 800
- Size 76px, line-height 1.0, letter-spacing −0.038em
- Colour: `#F8F6F2` (dark) / `#0C0B0A` (light)
- `text-shadow: 0 2px 24px rgba(12,11,10,0.55)` (dark) / `0 2px 24px rgba(247,245,241,0.7)` (light)

> Note: the text-shadow exists only so the last line stays legible where it crosses the bezel. If you instead render the headline *behind* the phone so the word is partially occluded, drop the shadow — it is a crutch, and partial occlusion reads better.

**Subhead** — verbatim: `Create a professional digital presence without building a website from scratch.`
- Plus Jakarta Sans 400, 21px, line-height 1.5, letter-spacing −0.01em
- `max-width: 420px; margin-top: 40px`
- Colour `#94918A` (dark) / `#6E6C67` (light)

**CTA row** — `display: flex; gap: 14px; margin-top: 44px`

*Primary — "Create your OWNA"*
- height 58px, padding `0 34px`, border-radius 999px
- background `#1B62F5`, hover `#1450D8`
- text `#FFFFFF`, 17px, weight 600, letter-spacing −0.01em

*Secondary — "See real profiles"* (frosted glass — this is load-bearing, see Interactions)
- height 58px, padding `0 30px`, border-radius 999px, 17px, weight 500, letter-spacing −0.01em

Dark:
```css
background: rgba(248,246,242,0.10);
backdrop-filter: blur(24px) saturate(1.6);
border: 1px solid rgba(248,246,242,0.26);
box-shadow: 0 1px 0 rgba(255,255,255,0.22) inset,
            0 10px 28px -10px rgba(0,0,0,0.55);
color: #F8F6F2;
/* hover */ background: rgba(248,246,242,0.17); border-color: rgba(248,246,242,0.44);
```
Light:
```css
background: rgba(255,255,255,0.58);
backdrop-filter: blur(24px) saturate(1.7);
border: 1px solid rgba(255,255,255,0.72);
box-shadow: 0 1px 0 rgba(255,255,255,0.7) inset,
            0 10px 28px -12px rgba(20,18,14,0.42);
color: #0C0B0A;
/* hover */ background: rgba(255,255,255,0.74); border-color: rgba(255,255,255,0.9);
```
Always ship `-webkit-backdrop-filter` alongside. Include an opaque fallback for `@supports not (backdrop-filter: blur(1px))`.

**URL chip** — `margin-top: 56px`, inline-flex, height 40px, padding `0 8px 0 16px`, border-radius 999px, gap 10px.
- Dot: 6px circle — `#B8F03C` (dark) / `#1B62F5` (light)
- Label: JetBrains Mono 400, 13px, `owna.online/mayatanaka`, colour `#CFCCC5` (dark) / `#4A4842` (light)
- Copy affordance: 26px circle, `rgba(248,246,242,0.10)` (dark) / `rgba(12,11,10,0.06)` (light), containing a copy glyph — use the repo's existing icon set, do not hand-draw
- Container: `rgba(248,246,242,0.06)` + `1px solid rgba(248,246,242,0.12)` (dark) / `#FFFFFF` + `1px solid rgba(12,11,10,0.10)` + `0 2px 6px rgba(20,18,14,0.06)` (light)

The chip should be a real button that copies the URL to clipboard with a transient "Copied" state.

**Phone** — realistic device, not an abstract shell.
- Shell: 384 × 760, border-radius 52px, background `#1A1A1C`, padding 10px, `transform: rotate(-2deg)`
- Shell shadow, dark: `0 2px 0 rgba(255,255,255,0.16) inset, 0 50px 90px -24px rgba(0,0,0,0.75)`
- Shell shadow, light: `0 2px 0 rgba(255,255,255,0.16) inset, 0 46px 80px -26px rgba(20,18,14,0.5)`
- Screen: fills shell, border-radius 43px, `overflow: hidden`, background `#14170F` (matches the profile's own dark olive so there is no flash before the video paints)
- Video: absolutely positioned, `width/height: 100%`, `object-fit: cover`, `transform: translate(-50%,-50%) scale(1.07)`. **The 1.07 scale is intentional** — it crops the source recording's scrollbar sliver off the right edge.
- Top fade: 80px tall, `linear-gradient(to bottom, #14170F 34%, rgba(20,23,15,0))` — hides the loop seam and seats the status bar
- Status bar: 48px tall, padding `0 30px`, space-between. Time "9:41" at 14px weight 600 `#F8F6F2`; right side is signal bars (4 rounded 3px-wide rects, heights 4/6/8/10px, last at 40% opacity) and a battery (23 × 12, radius 3, 1px border `rgba(248,246,242,0.55)`, 70%-filled inner bar)
- Dynamic island: 116 × 32, border-radius 999px, `#000000`, `top: 12px`, centred

**Lime glow (dark mode only)** — `right: 40px; top: 180px`, 760 × 760, `border-radius: 999px`, `background: radial-gradient(circle, rgba(184,240,60,0.14), rgba(184,240,60,0) 60%)`, `filter: blur(16px)`. Sits below the phone in z-order. This is the accent of the profile in the footage spilling onto the page. Light mode has no glow.

### 2. Mobile hero (reference frame 390 × 844)

**Layout** — the device frame is dropped entirely (a phone inside a phone is redundant). The footage becomes a rotated block anchored to the bottom, with copy over it.

- Container padding: `72px 28px 0`
- Footage block: `position: absolute; left: 0; right: -60px; bottom: 0; height: 470px; transform: rotate(-2deg); transform-origin: left bottom; border-top-left-radius: 26px; overflow: hidden; background: #14170F`. The negative right inset and rotation are what make it bleed off the right edge.
- Video inside: `object-fit: cover; object-position: top; transform: scale(1.06)`
- Top fade over the footage: 90px, `linear-gradient(to bottom, #0C0B0A, rgba(12,11,10,0))` (dark). In light mode the fade is omitted at the top; the block reads as a solid dark panel against cream.
- Copy sits at `z-index: 2` above the footage.

**Headline** — different line breaks from desktop, because the column is narrow:
```
Your online
presence should
feel like you.
```
42px, weight 800, line-height 1.04, letter-spacing −0.035em. Dark adds `text-shadow: 0 2px 20px rgba(12,11,10,0.6)`.

**Subhead** — 16px, line-height 1.5, `max-width: 300px; margin-top: 22px`.

**CTAs** — stacked full-width, `flex-direction: column; gap: 10px; margin-top: 26px`, height 54px each, 16px text, same fills as desktop (primary weight 600, secondary weight 500 frosted).

**URL chip** — `margin-top: 22px`, height 34px, padding `0 14px`, gap 9px, 5px dot, 12px mono label. In dark mode over footage the container is `rgba(12,11,10,0.55)` with `1px solid rgba(248,246,242,0.14)`.

All touch targets are ≥ 44px (CTAs are 54px; the 34px chip is decorative-plus-copy — if it is the only copy affordance on mobile, raise it to 44px).

## Interactions & Behavior

**Video playback — the most important behaviour in this design.**

- `muted`, `playsinline`, `preload="auto"`, no controls, poster = first frame of the recording
- `playbackRate = 0.7` — the raw recording scrolls a full profile in 16s, which is too fast to read. 0.7× makes the project cards legible.
- `loop = false`, handled manually: on `ended`, set `currentTime = 0`, wait **1200ms**, then `play()`. The hold at the top lets a visitor register the person's name and role before the scroll starts again.
- Pause when off-screen via `IntersectionObserver`. **Gate on `intersectionRatio > 0`, not `isIntersecting` with a threshold** — a threshold-based gate fails inside iframes and embedded previews where `rootBounds` is null. Start every video playing on mount and only *pause* on the off-screen branch; never make first playback depend on an observer callback firing.
- Respect `prefers-reduced-motion: reduce` — show the poster frame and do not autoplay. This is not in the prototype and must be added.
- Autoplay can still be refused; catch the rejected `play()` promise and fall back to the poster rather than throwing.

**Loop seam.** The recording ends mid-page, so a raw loop snaps. The top fade gradient plus the 1200ms hold covers it. If it still reads badly, crossfade two stacked video elements offset by the duration.

**Responsive.** Two distinct compositions, not one fluid layout — the desktop version positions a device absolutely, the mobile version drops the device entirely and rotates a bare video block. Switch at the repo's existing tablet breakpoint. Between them, the safest intermediate is the mobile composition at a larger type scale.

**Hover states.** Only the two CTAs and the URL chip have them; all use the fills listed above. No transform-on-hover anywhere.

## State Management

Minimal — this is a presentational section.

- `copied: boolean` — transient state for the URL chip's clipboard confirmation (reset after ~2s)
- `theme` — read from the site's existing light/dark mechanism; do not introduce a new one. The design assumes the mode switch already in the nav.
- Video element refs, plus a per-video timer handle for the top-of-loop hold. Clear all timers and disconnect the observer on unmount.

No data fetching. The profile in the footage is a fixed asset.

## Design Tokens

**Colours**

| Token | Value | Use |
|---|---|---|
| Surface, dark | `#0C0B0A` | Hero background, dark mode. Slightly warm, not pure black. |
| Surface, light | `#F7F5F1` | Hero background, light mode. Warm off-white. |
| Text, dark mode | `#F8F6F2` | Headline, CTA labels |
| Text, light mode | `#0C0B0A` | Headline, CTA labels |
| Muted, dark mode | `#94918A` | Subhead |
| Muted, light mode | `#6E6C67` | Subhead |
| Mono label, dark | `#CFCCC5` | URL chip text |
| Mono label, light | `#4A4842` | URL chip text |
| Cobalt | `#1B62F5` | Primary CTA. Marketing chrome only. |
| Cobalt hover | `#1450D8` | Primary CTA hover |
| Lime | `#B8F03C` | Profile accent. Chip dot (dark) and glow only — never on chrome. |
| Lime glow | `rgba(184,240,60,0.14)` | Dark-mode radial spill |
| Device shell | `#1A1A1C` | Phone body |
| Profile screen | `#14170F` | Video backdrop / fade colour |
| Hairline, dark | `rgba(248,246,242,0.12)` | Chip border |
| Hairline, light | `rgba(12,11,10,0.10)` | Chip border |

Note the deliberate warmth: the dark surface is `#0C0B0A`, not `#0A0A0A`, so that dark and light read as one system rather than an inversion. The current site's neutral black against a warm cream is the temperature mismatch this corrects.

**Typography**

| Role | Family | Weight | Size | Line-height | Tracking |
|---|---|---|---|---|---|
| Headline, desktop | Plus Jakarta Sans | 800 | 76px | 1.0 | −0.038em |
| Headline, mobile | Plus Jakarta Sans | 800 | 42px | 1.04 | −0.035em |
| Subhead, desktop | Plus Jakarta Sans | 400 | 21px | 1.5 | −0.01em |
| Subhead, mobile | Plus Jakarta Sans | 400 | 16px | 1.5 | normal |
| CTA, desktop | Plus Jakarta Sans | 600 / 500 | 17px | — | −0.01em |
| CTA, mobile | Plus Jakarta Sans | 600 / 500 | 16px | — | — |
| URL chip | JetBrains Mono | 400 | 13px / 12px | — | — |
| Status bar time | Plus Jakarta Sans | 600 | 14px | — | — |

**Plus Jakarta Sans is a stand-in.** The live site uses a geometric grotesque with a distinctive quirky `a` that I matched as closely as a Google Font allows. Use whatever face the repo already loads for headings — do not add a font dependency to match the prototype.

**Spacing** (vertical rhythm of the copy column, desktop): headline → subhead 40px; subhead → CTA row 44px; CTA row → URL chip 56px. Mobile: 22 / 26 / 22.

**Radii**: 999px (pills, chip, glow), 52px (device shell), 43px (device screen), 26px (mobile footage block top-left), 3px (battery).

**Shadows**: listed inline per component above. There are only three real shadows in the design — device, frosted button, light-mode chip. Do not add more.

## Assets

| File | Notes |
|---|---|
`assets/owna-profile.mp4` | The screen recording. 662 × 1426, 16.13s, ~4.3MB. **Needs work before shipping** — see below. |
`assets/poster-frame.png` | First frame, extracted from the recording. Use as the `poster` and as the reduced-motion still. |
`reference/hero-current-dark.png` | Current live hero, dark mode |
`reference/hero-current-light.png` | Current live hero, light mode |
`reference/product-*.png` | Real product UI screenshots — the visual language the footage shows |

**Video pipeline recommendations:**

1. **Re-record if you can.** The current recording has a visible pointer/touch dot mid-screen that no crop can remove, and uneven scroll velocity. A clean pass at constant speed is the single highest-value improvement to this hero.
2. Encode two sources: H.264 MP4 (baseline compatibility) and VP9/AV1 WebM (smaller). Serve both in `<source>` tags.
3. Cap the encode near 720 × 1550 — the device renders at 364 × 740 CSS px, so ~2× is plenty. Target under 1.5MB.
4. Strip the audio track entirely; it is muted and unused.
5. Do not lazy-load it — it is above the fold and is the hero's subject. Preload it and let the poster cover the gap.
6. The profile shown is a real published profile (`owna.online/mayatanaka`). Confirm you have the person's permission to use their profile in marketing, and keep the URL on the chip matching the profile actually on screen.

## Files

| File | What it is |
|---|---|
`OWNA Hero Redesign.dc.html` | The design prototype. Opens in a browser. Shows four frames: desktop dark, desktop light, mobile dark, mobile light. Reference only — proprietary component format, inline styles, not portable code. |
`CLAUDE_CODE_PROMPT.md` | A ready-to-paste brief for Claude Code, with the recommended implementation sequence. |
`assets/`, `reference/` | As listed above. |

## Known gaps to close during implementation

Things the prototype does not solve, listed so they do not get missed:

1. **`prefers-reduced-motion`** — not handled in the prototype. Required.
2. **Headline overlap is shallow** — the widest line crosses the bezel by only ~25px, so the effect reads as a near-miss. Either move the device ~40px further left, or render the headline behind the device for genuine occlusion.
3. **`backdrop-filter` in a rotated stacking context** can render soft or fail in Safari. Test on real Safari; keep the `@supports` fallback.
4. **The device bleed is a static crop.** Scroll-linking it — device translating up at ~0.85× page speed — is what will make the bleed feel intentional rather than clipped. Worth doing, but ship without it first.
5. **Nothing carries the eye out of the hero.** The off-axis composition leaves a quiet bottom-left corner that would take a scroll cue well. Out of scope for this handoff.
6. **Accessibility** — the video is decorative-but-informative. Give it an `aria-label` describing what it shows, or a visually-hidden text equivalent describing a profile page. Ensure the frosted secondary CTA clears 4.5:1 against the brightest frame of the footage behind it, not just against the flat background.
