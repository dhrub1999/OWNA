# OWNA — build context

Handoff notes for whoever picks this up next. `README.md` covers how to run
the repo; this file covers **why it is shaped the way it is**, what is proven
versus assumed, and what to do next.

- Currently on branch `chore/ui-bugs` (branched off `main`, no unique commits
  yet — just uncommitted working-tree fixes, see §11).
- `main` is at `9efbbe2` (2026-08-29), merged from `feat/explore-section`.
- Live Supabase project: `ccohfxrjpnrherqflpxa`.
- This file was last fully rewritten 2026-08-29. Sections older than that are
  either folded into the current-state sections below or kept as dated
  history where the reasoning is still worth having.

---

## 1. Status at a glance

| Area | State |
| --- | --- |
| Schema, RLS, RPC, storage | **Applied to the live project.** 10 migrations, latest `20260828000000_grant_authenticated_profile_writes.sql`. |
| Public profile route + renderer | Done |
| Nine blocks | Done (`hero`, `text`, `social`, `links`, `projects`, `image`, `gallery`, `embed`, `divider`) |
| Theme system + 10 presets | Done, contrast-tested |
| Editor (canvas, outline, inspectors, autosave, undo) | Done |
| Auth (Google + email/password + anonymous) | Done, hardened — see §9 |
| Product-first onboarding (guest build → publish-gated account) | Done — see §9 |
| Dashboard onboarding tour (driver.js) | Done — see §10.4 |
| Uploads + quota + orphan sweep | Done |
| Publish / unpublish / preview / dashboard / share | Done |
| Public discovery directory (`/discover`, opt-in) | Done — see §10.2 |
| Persona landing pages (`/for/{persona}`), `/pricing` | Done — see §10.2 |
| Marketing homepage: scroll-pinned build-flow preview | Done — see §10.3 |
| First-publish feedback prompt + global error boundary | Done — see §10.1 |
| SEO, OG image, robots, sitemap, JSON-LD | Done |
| Unit tests | **148 passing across 10 files** (`bun run test`) |
| Typecheck | **Clean** (`bun run typecheck`) |
| Lint | **Not clean** — see §1.1, this is new since the last rewrite |
| Playwright e2e | Both specs pass live once pointed at a real recipient — see §9.1 |
| RLS integration tests | Written; not re-run this session (needs `OWNA_TEST_SUPABASE_*` env vars) |

`bun run build` was not re-run this pass (no reason to expect it's broken —
typecheck is clean and nothing touched build config besides `next.config.ts`'s
image-domain addition in the marketing overhaul — but it hasn't been confirmed
this session).

### 1.1 Lint is currently red — new finding

`bun run lint` reports 209 problems. Almost all of them (185+) are noise from
`supabase/.temp/start-secrets/supabase_edge_runtime_owna/main/index.ts` — a
generated file the Supabase CLI drops locally when you run `supabase start`,
which ESLint's flat config isn't excluding. That directory should be in
`.eslintignore`/the ignores array, not fixed line by line.

Two **real** errors, unrelated to the temp file, both look like they landed in
the 2026-08-27 Magic UI commit (`5743e48`) and haven't been touched since:
- `components/theme-toggle.tsx:21` —
  `react-hooks/set-state-in-effect`: a synchronous `setMounted(true)` inside a
  `useEffect`. §3 already documents this rule as an error in this repo; this
  file predates that being enforced, or was added without checking. Needs the
  same derive-during-render treatment as `lib/hooks/use-username-availability.ts`.
- `lib/demo-profiles.ts:21` — `no-explicit-any`.

`test-dom.js` also fails `no-require-imports` — this is a loose top-level
script (not part of `tests/`), predates this rewrite, and is a one-line fix
(`import` instead of `require`) whenever someone touches it.

**Do not report "lint is green" without re-running it** — the previous version
of this file said typecheck/lint/build/test were "all green as of this
session" and that had already gone stale by the time this rewrite happened.

---

## 2. Decisions locked with the user

**Vercel, not Cloudflare.** No host-specific APIs are used, so Cloudflare via
OpenNext stays possible — `cacheComponents` and `next/og` are the two things to
re-validate if that ever happens.

**Draft rows + a published JSONB snapshot.** The editor mutates normalized
`profiles`/`pages`/`blocks`. Publishing denormalizes all of it into
`profile_publications.snapshot` via the `publish_profile()` RPC, built
server-side from the caller's own rows.

**Debounced autosave, explicit publish.** 800 ms debounce, no manual save
button. Publish is a separate, deliberate action.

**Product-first onboarding.** A visitor can build and see a fully curated page
before ever creating an account. Publishing is the point an account becomes
required — see §9.

**Directory listing is opt-in and admin-gated, never inferred.** Every
published profile today is internal test data, and nothing in the schema
distinguishes it from a future real one. Rather than filter out "obviously
fake" profiles, `/discover` starts empty for everyone and only shows a profile
once its owner opts in *and* an admin approves it (§10.2).

---

## 3. Next.js 16 things that will bite you

This is not the Next.js in most training data. All verified against
`node_modules/next/dist/docs/`.

- **`middleware.ts` is now `proxy.ts`** at the repo root, exporting `proxy`.
  Its matcher (`/dashboard`, `/editor`, `/settings`, `/onboarding`, `/preview`)
  only checks "is there a session" — it does not distinguish an anonymous
  session from a permanent one, and that turned out to be exactly right for
  the guest flow (§9) rather than something that needed changing.
- **`params` and `searchParams` are Promises.** Use the generated
  `PageProps<'/[username]'>` / `LayoutProps<'/'>` types, don't hand-write them.
- **`cacheComponents: true` is on.** Every request-time read must sit behind
  `<Suspense>` or the build fails at the prerender step. This also applies to
  **`useSearchParams()` in a client component** — it needs its own `<Suspense>`
  boundary even when the enclosing route is already fully dynamic. See
  `components/editor/toolbar.tsx`'s `PublishResumeWatcher`, split out from the
  toolbar itself for exactly this reason.
- **`use cache` scopes cannot call `cookies()` or `headers()`** anywhere in the
  call stack, and it fails *at request time*. This is why `lib/supabase/public.ts`
  exists as a third client.
- **`revalidateTag(tag, 'max')`** takes a second argument now.
- **`next/font` loaders require literal object arguments.** No spreads.
- **shadcn's current default style is `base-nova`, built on Base UI, not Radix.**
  Composition is `<Button render={<Link href="…" />}>`, **not** `asChild`.
- **`react-hooks/set-state-in-effect` and `react-hooks/refs` are errors.**
  See `lib/hooks/use-username-availability.ts` for the derive-during-render
  pattern — and see §1.1, `components/theme-toggle.tsx` currently violates
  this and lint is red because of it.

---

## 4. Architecture invariants

Break any of these and the design stops working. The first two are enforced by
`tests/unit/architecture.test.ts`.

1. **Block definitions are pure data.** `lib/blocks/definitions.ts` holds type,
   label, Zod schema and defaults — no React, no components. Imported by the
   editor, the public renderer, the save action, the onboarding template
   seeder (§9), the marketing build-flow preview (§10.3), and the tests.

2. **The public surface imports no editor code.** `components/public/**`,
   `app/[username]/**` and `components/icons/**` may not import editor-only
   modules or even `@/components/ui/*`.

3. **Block renderers are pure presentational components.** No `async`, no
   fetching. The server renders them for the public page and the editor
   renders *the same components* client-side for the live preview, the
   dashboard preview, and now the marketing homepage's build-flow preview
   (§10.3) — "preview matches production" by construction, extended to
   marketing rather than broken by it.

4. **The public page reads exactly one row**, `profile_publications.snapshot`.
   The directory listing (§10.2) follows the same rule: it reads
   `profile_publications` only, never joins back to `profiles`, which is why
   the three directory flags (`directory_opt_in`/`_persona`/`_status`) are
   denormalized onto both tables instead of living on `profiles` alone.

5. **Nothing trusts the client.** The publish snapshot is built in SQL by
   `publish_profile()` from `auth.uid()`'s own rows. `directory_status` follows
   the same rule one level further: it's admin-only, set exclusively via
   `set_directory_status()`, and no client role is ever granted `UPDATE` on
   that column directly (§10.2).

---

## 5. Non-obvious implementation notes

**Row types must be `type`, not `interface`** — an interface has no implicit
index signature, so supabase-js silently degrades every query result to
`never` instead of erroring.

**Zod v4 uses `.prefault({})`, not `.default({})`** for "an absent object
parses to full defaults."

**Colours are hex-only, on purpose** — keeps `lib/themes/contrast.ts` exact and
makes a colour unable to carry a CSS payload.

**Themes are inline CSS custom properties, never a generated stylesheet** —
works under CSP without a nonce, which is what keeps the page prerenderable.

**Responsive CSS uses container queries, not viewport media queries** — the
editor's device frames set a real width on a `container-type: inline-size`
context.

**Brand icons are inlined, not a dependency** — `components/icons/social-icons.tsx`
has path data extracted from Simple Icons (CC0) and committed.

**`username_available()` is `SECURITY DEFINER`** — reads `reserved_usernames`
and `profiles`, which `anon` cannot. Advisory only; the unique index on
`profiles.username` is what actually decides, so `claim_username` must handle
`23505`. It's granted to both `anon` and `authenticated`, which is what lets
the onboarding questionnaire live-check a handle before the visitor even has a
session.

**Reserved names are enforced by a trigger, not by the RPC** — RLS lets a user
insert their own `profiles` row with any username, so a check only inside
`claim_username()` would be bypassable by posting to the table directly.

**Autosave serializes its saves.** The compare-and-set on `profiles.updated_at`
turns a second tab into a clean conflict banner instead of a silent overwrite.

**Supabase anonymous sessions carry Postgres role `authenticated`, not
`anon`.** This is the load-bearing fact behind the entire guest-onboarding
design (§9): every RLS policy scoped `to authenticated` — which is all of
them — already works for an anonymous session with zero changes. An anonymous
user is a real row in `auth.users` (`is_anonymous: true`), not a special case.

**`getUser()` is wrapped in React's `cache()`** (`lib/supabase/server.ts`) so
the several places in one request that each need to know "who is this" — a
page, a layout, a Server Action — share one token revalidation instead of
paying for it repeatedly.

**`updateUser({ email, password })` on an anonymous session does not populate
`auth.users.email`** — only `email_change`/`user.new_email`, until the
confirmation link is clicked. This bit three different things at once before
it was understood; see §9.3 for the full story and the fix.

**Table-level grants are not implied by RLS, and nothing in migration history
revoked them — they can just be missing.** `authenticated` had no `INSERT`/
`UPDATE` grant on `profiles` or `profile_publications` (every other public
table had them), which failed writes before RLS was ever evaluated, as a flat
"permission denied for table" rather than an RLS violation. Fixed in
`20260828000000_grant_authenticated_profile_writes.sql`. Worth checking table
grants directly (`information_schema.role_table_grants`) rather than assuming
RLS policy presence is sufficient, if a similarly-flat permission error shows
up again.

**Resend rejects known-placeholder recipient domains outright** (`550`,
`could not send email`), and Supabase turns that into a bare `500` with **no
user row written** — not a config problem, a recipient problem. Cost two
separate sessions before this was understood; see §9.1.

---

## 6. What is proven, and what is not

**Verified this session (2026-08-29):**
- `bun run test`: 148 passing, 10 files.
- `bun run typecheck`: clean.
- All 10 migrations present in `supabase/migrations/`, latest dated 2026-08-28.

**Verified in the sessions this file folds in (see §9, §10 for dates):**
- Outbound auth email genuinely works on the live project — confirmed from
  `auth_logs`/`auth.users`, not inferred (§9.1).
- Both e2e specs pass live once they target a real acceptable recipient
  instead of `@example.com` (§9.1).
- `mailer_autoconfirm: false` live — confirmation emails are required and on
  the critical path (§9.2).
- Production build succeeds with `cacheComponents: true`.

**Not verified, still open:**
- **Lint has not been clean since at least 2026-08-27** (§1.1) — nobody has
  re-run it end to end since the Magic UI commit landed.
- **`bun run build` was not re-run this pass.**
- The Google `linkIdentity()` path in the publish gate has never been driven
  through a real Google consent screen — no browser extension has been
  available in any session so far, and headless automation can't get through
  Google's real login. **Still needs a manual click-through.**
- RLS integration tests (`tests/integration`) have not been re-run recently.
- The confirmation-link round trip has been observed via `auth_logs` timing
  (§9.1) but never watched end-to-end through a real inbox in-session.

---

## 7. Next steps, in order

1. **Fix lint** (§1.1): exclude `supabase/.temp/**` from ESLint's scope, fix
   `theme-toggle.tsx`'s effect-body `setState`, fix `demo-profiles.ts`'s `any`.
   Cheap, and "lint is red" is currently the single biggest gap between this
   file and reality.
2. **Re-run `bun run build`** and confirm the marketing overhaul (§10.3),
   directory routes (§10.2) and feedback/error-boundary additions (§10.1) all
   still prerender cleanly under `cacheComponents: true`.
3. **Manually verify the Google-linking path** in the publish gate — still
   nobody has clicked through it as a human.
4. **Run the RLS integration suite** against a scratch project:
   `OWNA_TEST_SUPABASE_URL=… OWNA_TEST_SUPABASE_PUBLISHABLE_KEY=… bun run test:integration`.
5. **Decide what happens to abandoned anonymous drafts** — a visitor who
   starts the questionnaire or builds a page and never creates an account
   leaves a real (harmless, but unbounded) row in `auth.users`/`profiles`. No
   cleanup job exists yet.
6. **Decide the admin workflow for `directory_status`.** The schema and RPC
   exist (§10.2) but there is no admin UI — approving a profile today means a
   direct SQL update via `set_directory_status()`. Fine at zero volume, not at
   scale.
7. **Lighthouse a published profile and the new marketing pages** (`/`,
   `/discover`, `/for/{persona}`, `/pricing`). Targets: Performance ≥ 95,
   Accessibility ≥ 95 on mobile. Never benchmarked since the marketing
   overhaul (§10.3) added a scroll-pinned, IntersectionObserver-driven section.
8. **Deploy to Vercel**, set env vars (including the same Supabase project),
   confirm publishing invalidates the cache within seconds, and confirm the
   `next.config.ts` image-domain addition from the marketing overhaul is
   correct for wherever product screenshots are actually served from.

---

## 8. Known gaps and deliberate omissions

- Rich text is plain text only — no sanitizer in this codebase, no
  `dangerouslySetInnerHTML` anywhere. Rich text must arrive *with* a sanitizer.
- Fonts are a fixed set of ten (`next/font/google` needs literal build-time
  calls).
- Multi-page profiles: the `pages` table supports it, the UI does not expose it.
- Custom domains: `domains` table exists and is empty.
- No rate limiting on `username_available` beyond Supabase's own auth limits.
- The orphan asset sweep runs fire-and-forget after publish, only touches
  uploads older than 24h. Move to `pg_cron` if storage costs grow.
- No cleanup for abandoned anonymous accounts/drafts (§7.5). No merge path if
  someone builds anonymously, then logs into a *different*, pre-existing
  account at the publish gate — the copy says the guest draft won't come with
  them, but nothing prevents them from trying, and the guest draft is simply
  orphaned under the anonymous user, not deleted.
- No admin UI for directory approval (§7.6) — `set_directory_status()` exists,
  nothing calls it but a human running SQL.
- `OWNA_E2E` / `OWNA_E2E_EMAIL_DOMAIN` are not documented in `.env.example` —
  only the integration-test vars are. Someone running `bun run test:e2e` cold
  has to find `tests/e2e/test-email.ts` to learn the recipient-domain trap.
- `supabase/.temp/` is not excluded from ESLint (§1.1) — should be added to
  the ignores list rather than left to be noticed again.
- No analytics beyond a dashboard placeholder, no remix, no theme marketplace,
  no AI — out of scope.

---

## 9. Onboarding and auth: the full arc, condensed

This folds together what were three separate sessions/sections in earlier
versions of this file (product-first onboarding; the email-confirmation gap
closure; the anonymous-upgrade bug hunt). All of it is now resolved and live;
kept here because the reasoning explains code that would otherwise look
overbuilt.

**The shape of the flow.** Land → "Create your OWNA" → anonymous sign-in
(`supabase.auth.signInAnonymously()`, fired the moment the CTA is clicked, in
`components/marketing/start-building-button.tsx`) → short questionnaire
(purpose, name, handle-with-live-check) → land in `/editor` pre-filled with a
curated starting page from `templateForPurpose()` (`lib/demo-profiles.ts`) →
edit freely → **Publish is the moment an account becomes required.**
`/onboarding/username` (the older, account-first-only entry point) was deleted
outright — everyone now goes through the questionnaire, including a fresh
email/Google signup, so the account-first path and the guest path produce the
identical curated first page instead of the account-first user getting a bare
handle form.

**Why anonymous auth, not a client-only draft.** Anonymous Supabase sessions
are real, cookie-backed `auth.users` rows carrying Postgres role
`authenticated` (§5) — every existing RLS policy, RPC and Server Action works
on one immediately, with zero schema changes for the guest case itself. The
only new schema for this was `onboarding_answers`, purely so a reload
mid-questionnaire restores progress.

**The publish gate.** An anonymous user hitting Publish gets a dialog
(`components/editor/publish-auth-gate.tsx`) instead of publishing.
"Create free account" calls `upgradeAnonymousAccount()`
(`supabase.auth.updateUser({email, password})`) — deliberately not
`signUpWithPassword`, which would mint a second, unlinked user and orphan the
draft. "Continue with Google" uses `linkIdentity()` client-side, redirecting
through `/auth/callback?next=/editor?publish=1`; `PublishResumeWatcher` in the
toolbar picks the interrupted publish back up on return.

### 9.1 The email saga: three false leads, one real bug, one real non-bug

This is worth reading in order because each earlier conclusion was reasonable
given what was known at the time, and got overturned by the next session:

1. **First read: "email delivery is broken in production."** `/signup` and
   the guest publish-gate both failed with `Error sending confirmation email` /
   `Error sending email change email`. Reasonable next suspect: unverified
   Resend sending domain, or SMTP credentials not actually saved on the
   Supabase project.
2. **Second read, closer but still wrong: a real bug in the upgrade path.**
   `supabase.auth.updateUser({ email, password })` on an anonymous session
   does **not** populate `auth.users.email` — only `email_change`/
   `user.new_email`, until the confirmation link is clicked. This genuinely
   broke three things: `signInWithPassword` couldn't find the user by `email`
   and returned a generic "wrong password" instead of "confirm your email";
   `isGuestSession()` checked `!user.email`, which never flips, so a same-tab
   republish re-opened the account-creation gate right after it had just
   succeeded; and worst, a fresh `/signup` or second anonymous upgrade with
   that same pending address silently created a **second, unrelated**
   `auth.users` row, permanently orphaning the first account's draft, since
   nothing reserves an address until it's confirmed. **Fixed**:
   `lib/auth/session.ts` now checks `user.new_email` too; migration
   `20260825150000_email_claimed_rpc.sql` added `email_claimed()` and
   `email_pending_confirmation()` (`SECURITY DEFINER`, same pattern as
   `username_available()`) so sign-up and sign-in can tell the difference
   between "taken", "pending", and "free" instead of guessing from a failed
   insert.
3. **Third read, the actual root cause of the *original* symptom: never a
   bug at all.** Outbound email on the live project works — verified directly
   from `auth_logs`: two different Gmail recipients had `confirmation_sent_at`
   set with no error, one confirmed 21 seconds after send. The `550`s in the
   logs were Resend refusing `@example.com` outright
   (`Invalid \`to\` field... instead of domains like \`example.com\``), which
   Supabase turns into an atomic `500` with **no user row written** — so it
   looked exactly like server-side delivery failure from the outside. The
   *only* place `@example.com` was ever used was the e2e suite.
   **Fixed**: `tests/e2e/test-email.ts` now generates
   `delivered+<tag>@resend.dev` (Resend's accept-always sink), with an
   `OWNA_E2E_EMAIL_DOMAIN` override for non-Resend targets like a local
   Inbucket.

Net effect: `friendlyAuthError()` (`app/(auth)/actions.ts`) still exists to
turn raw Supabase strings into something a visitor can act on, but it is
genuinely just UX polish now, not a workaround for broken delivery.

### 9.2 Live auth settings

`GET /auth/v1/settings` (unauthenticated, needs the anon key as `apikey` — a
useful way to check Auth config from a shell without a dashboard round trip):
`anonymous_users: true`, `email: true`, `google: true`,
`mailer_autoconfirm: false`. Confirmation emails are required and on the
critical path. **Re-check this if email behavior is ever in question again —
it has been silently flipped between sessions before.**

### 9.3 Email templates are load-bearing

`supabase/templates/{confirmation,recovery,email-change,magic-link}.html`,
wired into `supabase/config.toml` for local. Each links to
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…&next={{ .RedirectTo }}`.

Supabase's stock templates link to `/auth/v1/verify`, which **never reaches**
`app/auth/confirm/route.ts` — so with the default templates, that route and
all its `next` handling is dead code. Reverting a template to
`{{ .ConfirmationURL }}` silently breaks the post-confirmation redirect.

`{{ .RedirectTo }}` expands to a full URL, not a path, which is why
`safeNextTarget()` (`lib/validations/auth.ts`) exists alongside
`safeNextPath()`. It accepts same-origin absolute URLs and still refuses
everything else.

**The hosted project keeps its own copies under Auth → Emails** — editing the
files in this repo does not update it. No MCP tool exposes auth config, and
the Management API needs a PAT that is not in `.env.local`, so this has to be
pasted in by hand whenever a template changes. Last known state: unverified
whether this was ever confirmed done — re-check before relying on it.

### 9.4 Rate limits

Resend free tier: 100/day, 3,000/month, 2/sec — and Supabase's own
`rate_limit_email_sent` sits in front of it. Every resend affordance goes
through `components/auth/resend-button.tsx`: 60s cooldown persisted per address
in `localStorage` (a reload is the obvious way to "retry", so an in-memory
timer would reward it), a hard cap of 3 attempts, and never a send on mount.
`seedCooldown` starts the clock for screens reached immediately after a send.

`[auth.rate_limit] email_sent` in `config.toml` is raised to 30 for **local**
Inbucket testing only. Do not read local headroom as production headroom.

### 9.5 What auth/onboarding hardening shipped, in one list

- Marketing header is session-aware: `components/marketing/header-auth-slot.tsx`,
  an async server component in its own `<Suspense>` so `/` stays partially
  prerendered. Three states keyed on profile presence, not `is_anonymous`
  (nearly every visitor has *some* session).
- `/login` and `/signup` guard against an already-signed-in visitor
  (`app/(auth)/auth-screen.tsx`), and warn — rather than silently strand — a
  guest sitting on an unpublished draft.
- Every `?error=` code the auth routes emit is now handled
  (`lib/auth/errors.ts` + `components/ui/alert.tsx`).
- Full password reset flow: `/forgot-password`, `/forgot-password/sent`,
  `/reset-password`, plus `requestPasswordReset`/`resendPasswordReset`/
  `updatePassword`. Neutral responses throughout, so the form is not an
  account-existence oracle.
- `/signup/check-email` has a resend affordance instead of being a dead end.
- Registered-email collision at the publish gate has an `email-taken` view
  offering both choices, instead of a raw Supabase error string.
- `lib/auth/session.ts` holds the shared banner/gate predicates
  (`isGuestSession`, `needsEmailConfirmation`) — pulled out of
  `lib/supabase/server.ts` because `server-only` made them untestable and
  unusable from a client component; `server.ts` re-exports them.
- **`Skeleton` was invisible in light mode** — `--muted` and `--background`
  were both `#F7F6F2`. Now tinted from `foreground`.

### 9.6 Onboarding UX

- `components/onboarding/onboarding-shell.tsx` — two panes above `lg`,
  questions left, live preview right, dropping the preview below `lg` rather
  than stacking it illegibly.
- `components/onboarding/live-preview.tsx` + `lib/onboarding/preview-snapshot.ts`
  mount the real `ProfileRenderer` at a real 840px width scaled to fit — the
  blocks are container-query driven and would otherwise re-flow to mobile at a
  narrow width. **It shows curated demo content, not what actually gets
  seeded** (`starterBlockProps` is near-empty by design); the caption "Example
  content in this style" is load-bearing copy, not filler.
- `components/editor/publish-success-dialog.tsx` — first publish only, gated
  on `hasEverPublished`.
- `components/dashboard/activation-checklist.tsx` +
  `lib/onboarding/activation.ts` — derived from the draft's real contents,
  never a stored "completed steps" list; hides itself once complete. **See
  §11** for an in-progress fix to this file's avatar step.

---

## 10. Discovery, feedback, and the marketing overhaul (2026-08-26 → 2026-08-29)

Everything in this section is new since the last version of this file and was
not documented anywhere before this rewrite.

### 10.1 First-publish feedback + a real error boundary

`components/editor/feedback-prompt.tsx`, surfaced from
`publish-success-dialog.tsx` on a user's first publish: an optional
message, "where did you hear about us" and profile name, written via
`app/(app)/feedback-actions.ts` to the new `feedback` table
(`20260826120000_feedback.sql`). Write-only from the client's perspective —
`authenticated` gets `INSERT` only, no `SELECT`/`UPDATE`/`DELETE`; identity and
profile name are stamped server-side from the caller's own session, matching
every other mutation in this codebase, not posted by the client.

`app/error.tsx` and `app/global-error.tsx` are new — a root-level React error
boundary and a `global-error` fallback for failures in the root layout itself
(which `error.tsx` alone can't catch, since the layout that would render it is
what failed). Previously an uncaught render error had no boundary at all above
individual routes.

### 10.2 Public discovery directory (`/discover`, `/for/{persona}`, `/pricing`)

New route tree under `app/(marketing)/`. `/discover` and `/discover/[persona]`
list published profiles that opted in; `/for/{persona}` are five static
persona landing pages (consultant, photographer, freelancer, creative,
jewellery) each rendering a live demo `ProfileRenderer` snapshot, indexed via
a new `/for` directory page so they're reachable by more than search;
`/pricing` gives pricing its own indexable URL instead of only existing as a
`#pricing` anchor on the homepage — it renders the same `<Pricing />` section
the anchor still scrolls to, so the two can never diverge.

Schema: `20260826063655_directory.sql` adds `directory_opt_in` (boolean,
owner-controlled from the editor's Sharing panel), `directory_persona` (one of
the five personas above, seeded from the onboarding purpose, editable after),
and `directory_status` (`pending`/`approved`/`rejected`, **admin-only**) to
both `profiles` and `profile_publications` — denormalized onto the published
table for the same reason every other public read avoids joining back to
`profiles` (§4.4). A partial index
(`profile_publications_directory_idx`) matches the directory query's exact
filter (`is_live and visibility = 'public' and directory_opt_in and
directory_status = 'approved'`) for an index-only lookup.
`20260826063852_directory_admin_revoke_anon.sql` follows up by revoking
whatever grant would have let `anon`/`authenticated` write `directory_status`
directly — that column moves only through `set_directory_status()`.

There is deliberately no filter trying to exclude "obviously fake" test
profiles — every profile today *is* test data, and nothing distinguishes it
from a future real one, so the directory is opt-in-and-approved rather than
opt-out-if-suspicious (§2). This also means: **there is no admin UI yet** for
approving profiles (§7.6, §8) — someone has to call `set_directory_status()`
directly.

`app/sitemap.ts` and `app/robots.ts` were extended: the sitemap now includes
directory-eligible profiles and the new marketing routes; robots gained
`/login`, `/signup`, `/forgot-password`, `/reset-password` to its disallow
list (previously only the post-auth app routes were listed, even though these
pre-auth routes are equally uncrawlable-usefully). `app/manifest.ts` is new
(PWA manifest). `lib/seo/structured-data.ts` adds `jsonLdScript()` for
JSON-LD, used on the directory and persona pages.

### 10.3 Marketing homepage: scroll-pinned build-flow preview

`components/marketing/build-flow.tsx` — a new homepage section, scroll-pinned
above 1100px with the editor on the left and the live page it produces on the
right. Three sentinels and a single `IntersectionObserver` decide which step
is active; there is deliberately no scroll listener, because `scrollY` in
React state re-renders on every frame and this stage re-renders a whole
profile via the real block renderers (§4.3). `lib/marketing/build-flow-presets.ts`
holds the three theme presets the "Customize" step offers and the demo profile
it re-themes, reusing `lib/blocks/definitions.ts` and `lib/themes/presets.ts`
directly rather than hand-rolling parallel demo data.
`components/marketing/build-flow-preview.tsx` is the compact, non-interactive
render used elsewhere (e.g. persona cards) so the same visual doesn't need two
implementations.

New product screenshots in `public/assets/products/` (`hero.jpg`,
`gallery.jpg`, `embed.jpg`, `links.jpg`, `social-links.jpg`, `image.jpg`,
`text.jpg`, `projects.jpg`) — real screenshots of each of the nine blocks
rendered on an actual profile, used across the marketing pages and now also
referenced from `README.md`'s block gallery.

### 10.4 Dashboard onboarding tour

`components/dashboard/dashboard-tour.tsx`, using `driver.js`: a one-time,
`localStorage`-gated (`dashboard-tour-seen`) guided tour over the dashboard's
activation checklist and live preview, wired in `app/(app)/dashboard/page.tsx`.
Styling lives in `app/globals.css` under a `driverjs-theme` popover class
rather than the library's own CSS being used unstyled.

### 10.5 Magic UI + Base UI cursor polish

`5743e48` vendored a handful of Magic UI components in
(`components/magicui/{animated-theme-toggler,blur-fade,border-beam,marquee}.tsx`)
and touched cursor interactivity across several existing editor/auth
components (`image-field.tsx`, `repeatable-list.tsx`, `theme-panel.tsx`,
`publish-auth-gate.tsx`, `block-library.tsx`, `block-list.tsx`,
`password-input.tsx`, `button.tsx`). This is also the commit that introduced
the `theme-toggle.tsx` lint regression in §1.1 — worth a look if that file is
touched again, since it may be the source of other small regressions from the
same pass that haven't surfaced yet.

### 10.6 Grants fix

`20260828000000_grant_authenticated_profile_writes.sql` — see §5, "Table-level
grants are not implied by RLS."

---

## 11. In progress on `chore/ui-bugs` (uncommitted)

Two small fixes sitting in the working tree as of this rewrite, not yet
committed:

- **`app/(app)/dashboard/page.tsx`** — the dashboard preview panel didn't fill
  its column on desktop and could overflow instead of scrolling internally.
  Now `flex flex-col` + `lg:h-full` on the frame, with the `ProfileRenderer`
  wrapped in its own `min-h-0 flex-1 overflow-y-auto` region so a tall profile
  scrolls inside the preview instead of pushing the dashboard layout around.
- **`lib/onboarding/activation.ts`** — the "Add a photo" activation step only
  checked `profile.avatar_url`, so a user who set a photo on the hero block
  directly (rather than through Settings) never saw the step complete. Now
  also checks `hasText(blocks, "hero", "avatarUrl")`, and its link changed
  from `/settings` to `/editor` since that's the more common place people
  actually add one.

Neither has a test yet. Worth a quick manual pass on a narrow desktop window
before committing, given the flex/overflow change is exactly the kind of thing
that's easy to get subtly wrong across breakpoints.
