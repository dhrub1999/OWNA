# OWNA — build context

Handoff notes from the initial build. `README.md` covers how to run the repo;
this file covers **why it is shaped the way it is**, what is proven versus
assumed, and what to do next.

- Source PRD: `~/Downloads/songs/PRD — Customizable Digital Profile Platform.md`
- Approved plan: `~/.claude/plans/goofy-snacking-sparkle.md`
- Built on branch `feat/initial-setup`, on top of `8ebe6dc` (bare
  `create-next-app` + the Supabase agent skills in `.agents/`).

---

## 1. Status at a glance

| Area | State |
| --- | --- |
| Schema, RLS, RPC, storage | Written, **never executed against Postgres** |
| Public profile route + renderer | Done, verified rendering locally |
| Nine blocks | Done |
| Theme system + 10 presets | Done, contrast-tested |
| Editor (canvas, outline, inspectors, autosave, undo) | Done |
| Auth (Google + email/password) | Done, redirect flow verified |
| Uploads + quota + orphan sweep | Done |
| Publish / unpublish / preview / dashboard / share | Done |
| SEO, OG image, robots, sitemap | Done |
| Unit tests | 108 passing across 8 files |
| RLS integration tests | Written, **never run** (needs a live project) |
| Playwright e2e | Written, **never run** (needs a live project) |

`bun run build`, `bun run typecheck`, `bun run lint`, `bun run test` were all
green at handoff.

---

## 2. Decisions locked with the user

These came out of a planning conversation. Changing any of them is a real
redesign, not a refactor.

**Vercel, not Cloudflare.** The PRD named Cloudflare; the user chose Vercel for
full Next 16 support. No host-specific APIs are used, so Cloudflare via OpenNext
stays possible — but `cacheComponents` and `next/og` are the two things to
re-validate if that ever happens.

**Draft rows + a published JSONB snapshot.** The editor mutates normalized
`profiles`/`pages`/`blocks`. Publishing denormalizes all of it into
`profile_publications.snapshot`. Rejected alternatives: draft/published row
pairs (doubles rows, forces a multi-table join on every public request) and a
single JSONB document (loses per-block constraints and querying).

**Debounced autosave, explicit publish.** 800 ms debounce. Rejected: explicit
save only (people lose work), save-per-mutation (chatty on drag and on typing).

**Full MVP, phased, vertical slice first.** Auth → username → public URL was
made to work end to end before the editor existed.

---

## 3. Next.js 16 things that will bite you

This is not the Next.js in most training data. All verified against
`node_modules/next/dist/docs/`.

- **`middleware.ts` is now `proxy.ts`** at the repo root, exporting `proxy`.
- **`params` and `searchParams` are Promises.** `PageProps<'/[username]'>` and
  `LayoutProps<'/'>` are global generated types — use them, don't hand-write
  prop types.
- **`cacheComponents: true` is on.** Every request-time read must sit behind
  `<Suspense>` or the build fails at the prerender step, not at typecheck. When
  a route genuinely has no static shell, `export const instant = false` is the
  sanctioned escape hatch — `app/[username]/page.tsx` uses it and says why.
- **`use cache` scopes cannot call `cookies()` or `headers()`** anywhere in the
  call stack, and it fails *at request time*, so it can pass `next build` and
  break under `next start`. This is the entire reason `lib/supabase/public.ts`
  exists as a third client.
- **`revalidateTag(tag, 'max')`** takes a second argument now.
  `updateTag()` is Server-Action-only and immediate.
- **`next/font` loaders require literal object arguments.** No spreads, no
  shared options constant — the build parses them statically. Cost us one build
  failure; see the comment in `lib/themes/fonts.ts`.
- **shadcn's current default style is `base-nova`, built on Base UI, not Radix.**
  Composition is `<Button render={<Link href="…" />}>`, **not** `asChild`.
- **`react-hooks/set-state-in-effect` and `react-hooks/refs` are errors**, not
  warnings. Synchronous `setState` in an effect body and ref writes during
  render both fail lint. See `lib/hooks/use-username-availability.ts` for the
  derive-during-render pattern that replaced the naive version.

---

## 4. Architecture invariants

Break any of these and the design stops working. The first two are enforced by
`tests/unit/architecture.test.ts`.

1. **Block definitions are pure data.** `lib/blocks/definitions.ts` holds type,
   label, Zod schema and defaults — no React, no components, and it is a `.ts`
   file so it cannot contain JSX. It is imported by the editor, the public
   renderer, the save action and the tests; a React import here leaks into all
   four.

2. **The public surface imports no editor code.** `components/public/**`,
   `app/[username]/**` and `components/icons/**` may not import
   `@/components/editor`, `@/lib/editor`, `@dnd-kit`, `react-colorful`, or even
   `@/components/ui/*`. That last one is why `app/[username]/not-found.tsx` uses
   plain styled links instead of `<Button>`.

3. **Block renderers are pure presentational components.** No `async`, no
   fetching, no `server-only`. The server renders them for the public page and
   the editor renders *the same components* client-side for the live preview.
   This is what makes "preview matches production" true by construction. The
   three permitted client islands are `gallery-lightbox`, `embed-frame` and
   `share-card`.

4. **The public page reads exactly one row.** Everything needed is inside
   `profile_publications.snapshot`. No joins, no N+1, and the read is legal
   inside `use cache` because it uses the cookie-less client.

5. **Nothing trusts the client.** The publish snapshot is built in SQL by
   `publish_profile()` from `auth.uid()`'s own rows — never posted by the
   browser. URLs are re-validated at render time as well as on write, because
   rows written by an older schema outlive that validation. Embeds never render
   user HTML; a pasted URL is matched against a strict per-provider pattern and
   the iframe `src` is built from a fixed template.

---

## 5. Non-obvious implementation notes

**Row types must be `type`, not `interface`.** An interface has no implicit
index signature, so it is not assignable to the `Record<string, unknown>` that
supabase-js requires of a table Row — and when that constraint fails, supabase-js
silently degrades **every query result to `never`** instead of erroring at the
definition. Cost about twenty confusing type errors before it was spotted.

**Zod v4 uses `.prefault({})`, not `.default({})`,** for "an absent object
parses to full defaults". `.default()` takes the *output* type and would demand
a complete pre-parsed object. Every nested schema in `lib/themes/schema.ts` and
`lib/blocks/definitions.ts` relies on this.

**Colours are hex-only, on purpose.** It keeps the contrast maths in
`lib/themes/contrast.ts` exact and makes it impossible for a colour to carry a
CSS payload. `red; background: url(…)` simply does not match the pattern.

**Themes are inline CSS custom properties, never a generated stylesheet.** No
string interpolation into a CSS parser, works under CSP without a nonce (which
is what keeps the page prerenderable), and the editor preview updates by handing
React a new object with no stylesheet churn.

**Responsive CSS uses container queries, not viewport media queries.** The
editor's device frames set a real width on a `container-type: inline-size`
context. With viewport queries the mobile preview would lie — it would just be a
narrow column showing the desktop layout.

**Brand icons are inlined, not a dependency.** Lucide v1 dropped all brand
glyphs. `components/icons/social-icons.tsx` has path data extracted from Simple
Icons (CC0) and committed, so the public page ships eleven paths instead of a
3,400-icon package. LinkedIn is absent from Simple Icons (trademark request), so
its glyph is reconstructed from the mark's geometry. Regenerate by re-extracting
`d` from `node_modules/simple-icons/icons/<slug>.svg`.

**`username_available()` is `SECURITY DEFINER` on purpose.** It reads
`reserved_usernames` and `profiles`, which `anon` cannot. It returns one boolean
about a caller-supplied candidate, and usernames are public URLs by design, so
the enumeration it permits reveals nothing that visiting the URL would not. It
is advisory — the unique index is what actually decides, and `claim_username`
must handle `23505`.

**Reserved names are enforced by a trigger, not by the RPC.** RLS lets a user
insert their own `profiles` row with any username, so checking only inside
`claim_username()` would be trivially bypassable by posting to the table.

**`proxy.ts`'s matcher is deliberately narrow.** Public profile routes must
never reach it: reading cookies there would attach `Set-Cookie` to otherwise
fully cacheable responses.

**Autosave serializes its saves.** Two overlapping saves would each carry a
revision the other is about to invalidate, producing a spurious conflict. The
compare-and-set on `profiles.updated_at` turns a second tab into a clean
conflict banner instead of a silent overwrite.

---

## 6. What is proven, and what is not

**Verified locally:** landing page renders the demo profile through the real
`ProfileRenderer`; `/tamal` 404s with the claim CTA; `/dashboard` 307s to
`/login?next=/dashboard`; security headers and CSP present on every response;
`robots.txt` correct; production build with all 17 routes.

**Measured:** the public route is **245 KB gzipped** (862 KB raw) — essentially
all React 19 + Next 16 runtime, our code is the small tail. The landing page
copy was corrected from "ships almost no JavaScript" to something the number
supports. If this needs to come down, the levers are lazy-loading the two block
islands (small) or getting off the Next client router (not practical).

**Not verified — this is the honest gap:** no SQL has ever run. No Docker
locally and the Supabase CLI login is interactive, so the migrations, RLS
policies, triggers and RPC functions are hand-authored and unexecuted. Expect to
fix syntax or ordering on first `db push`.

**Two bugs the tests caught while being written** (both fixed): `parseBlockProps`
threw on a non-object instead of falling back to defaults, and
`hexToRgb("nonsense")` returned `NaN` channels — eight hex-shaped characters that
would have silently poisoned every contrast ratio computed from them.

**Three bugs found post-handoff (all fixed):**
1. **CSP blocking Next.js hydration:** `next.config.ts` originally omitted `script-src` to avoid locking down scripts, but because `default-src 'self'` was set, it cascaded and blocked all inline scripts. This stopped React from booting entirely. Fixed by explicitly adding `"script-src 'self' 'unsafe-inline' 'unsafe-eval'"`.
2. **Google sign-in silent failure:** Caused by the hydration bug above. Because React never booted, the `onClick` event handler on the Google button was never attached.
3. **Email sign-up CSP error:** In Next.js 15 / React 19, `action={onSubmit}` injects a `javascript:` fallback to prevent default form submissions before hydration. The `form-action 'self'` CSP blocked this `javascript:` scheme. Fixed by changing the form to use `onSubmit={handleSubmit}` with standard `e.preventDefault()`.

---

## 7. Next steps, in order

1. **Apply the schema.** Interactive, so run it yourself:
   ```
   bunx supabase login
   bunx supabase link --project-ref ccohfxrjpnrherqflpxa
   bunx supabase db push
   bunx supabase db advisors        # fix everything it flags
   bunx supabase gen types typescript --linked > types/database.ts
   ```
   The generated types should barely differ from the hand-written ones. If they
   differ meaningfully, **the migrations are the truth** — fix the code.

2. **Configure auth in the Supabase dashboard.** Enable Google under
   Authentication → Providers, add `<origin>/auth/callback` as a redirect URL.

3. **Run the two suites that matter.** They skip themselves without credentials
   and need a scratch project with email confirmation disabled:
   ```
   OWNA_TEST_SUPABASE_URL=… OWNA_TEST_SUPABASE_PUBLISHABLE_KEY=… bun run test:integration
   OWNA_E2E=1 bun run test:e2e
   ```
   The RLS suite is the most important test in the repo — RLS failures are
   silent, and nothing in TypeScript can catch them.

4. **Walk the §43 checklist by hand** — the ten-step list in the plan file, from
   signup through publish, username change and unpublish.

5. **Lighthouse a published profile.** Targets: Performance ≥ 95,
   Accessibility ≥ 95 on mobile.

6. **Deploy to Vercel**, set env vars, confirm publishing invalidates the cache
   within seconds.

---

## 8. Deviations from the approved plan

- **`reorder_blocks` RPC removed.** The plan specified it, but the editor sends
  the whole document on save, so positions are rewritten by array order and the
  RPC was dead code. Removed from the migration and the types.
- **Image uploads pulled forward** from Phase 6 into Phase 3 — four inspectors
  needed the field before the phase would have arrived.
- **Undo/redo added**, which the plan did not call for. Bounded 50-step history
  with 700 ms edit coalescing, so undo walks back through decisions rather than
  keystrokes. Cheap given documents are small, and a builder without it is
  frustrating.
- **The `Toaster` moved out of the root layout** into `app/(app)/layout.tsx`
  after the bundle measurement — it is a client component and a public profile
  has nothing to toast.
- **`types/database.ts` is hand-written**, contrary to the plan's "never
  hand-write it", because generating it requires a linked project. It carries a
  header saying so. Regenerate at step 1 above.

---

## 9. Known gaps and deliberate omissions

- Rich text is plain text only. There is no sanitizer in this codebase and no
  call to `dangerouslySetInnerHTML` anywhere — that is a property worth keeping.
  Rich text is a v1.1 feature that must arrive *with* a sanitizer.
- Fonts are a fixed set of ten. `next/font/google` needs literal build-time
  calls, so user-supplied fonts need a different loading path entirely.
- Multi-page profiles: the `pages` table supports it, the UI does not expose it.
- Custom domains: `domains` table exists and is empty, so mapping a hostname to
  a `profile_id` is a renderer lookup change rather than a migration.
- No rate limiting on `username_available` beyond Supabase's own auth limits.
  Worth adding a `rate_limits` table if abuse shows up.
- The orphan asset sweep runs fire-and-forget after publish and only touches
  uploads older than 24 h. If storage costs grow, move it to `pg_cron`.
- No analytics, no discovery, no remix, no marketplace, no AI — all explicitly
  out of scope per PRD §5 and §44.
