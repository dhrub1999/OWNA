# Claude Code brief — implement the off-axis hero

Paste this into Claude Code from your repo root, with this folder available (e.g. copied to `design_handoff_hero_offaxis/` inside the repo, or referenced by absolute path).

---

## The prompt

> Read `design_handoff_hero_offaxis/README.md` in full before writing any code. It is a high-fidelity design spec for replacing the marketing hero section.
>
> Then, **before implementing**, do a survey pass and report back to me:
> - Which file(s) currently render the hero, and what component structure they use
> - How the project handles styling (Tailwind config, CSS modules, styled-components, etc.) and whether any of the spec's colours already exist as tokens
> - How light/dark mode is currently implemented, and how I should hook into it rather than adding a new mechanism
> - Which fonts are already loaded, and what the heading face actually is (the spec uses Plus Jakarta Sans as a stand-in — use the real one)
> - Where static assets live and how video/images are served
> - Whether there is an existing icon set I should pull the copy glyph from
>
> Do not write the component until you have shown me that survey and I have confirmed the approach.
>
> Constraints for the implementation itself:
> - Headline and subhead copy are **verbatim** — do not rewrite them. Headline line breaks are explicit and differ between desktop and mobile; see the spec.
> - Use the repo's existing tokens, utilities, and component patterns. Do not port the prototype's inline styles.
> - Desktop and mobile are **two distinct compositions**, not one fluid layout.
> - The device must be clipped by the section's bottom edge. That is intentional, not a bug to fix.
> - Cobalt is for chrome, lime only appears inside the device. Do not introduce any other colour.
> - Add `prefers-reduced-motion` handling — the spec omits it and it is required.
> - Video playback: 0.7× rate, manual loop with a 1200ms hold at the top, pause off-screen gated on `intersectionRatio > 0` (not a threshold). Read the spec's Interactions section carefully; the gating detail matters.
> - Ship the `@supports` fallback for `backdrop-filter`.
>
> Work in this order, and stop after each step so I can look:
> 1. Video asset prep — transcode, poster extraction, wire the sources
> 2. Static desktop dark, no video (poster only), correct type and spacing
> 3. Desktop light
> 4. Video playback behaviour
> 5. Mobile composition, both modes
> 6. The known-gaps list at the end of the spec

---

## Why this order

The hero's risk is concentrated in two places: the type/position composition, and the video behaviour. Building them in the same pass means debugging both at once. Getting the static frame right against a poster image first means that when you turn playback on, anything that breaks is playback.

Step 1 comes first because the asset dictates the rest — if you re-record the footage (recommended), the poster frame and the `scale()` crop values both change, and you do not want to have tuned them against the old file.

## What to hand over alongside this

- The whole `design_handoff_hero_offaxis/` folder
- Open `OWNA Hero Redesign.dc.html` in a browser yourself first so you know what "right" looks like — the four frames are desktop dark, desktop light, mobile dark, mobile light
- If you have the live site running locally, have it open next to the prototype

## Things to decide before you start

Two open questions in the spec that Claude Code cannot answer for you:

1. **Re-record the footage, or ship the existing recording?** The current file has a pointer dot mid-screen that cannot be cropped out. If you are re-recording, do it before step 1. my response - Yes its done and already in that folder `design_handoff_hero_offaxis/assets/owna-mayatanaka-profile.mp4`
2. **Does the person in the footage know their profile is going in the marketing hero?** The URL chip names them. Worth confirming. my response - the profile in the video which is featured is fictional, so no need to confirm anything with them. just dont feature the user name "owna.online/mayatanaka"
