# OWNA — build context

Handoff notes for whoever picks this up next. `README.md` covers how to run
the repo; this file covers **why it is shaped the way it is**, what is proven
versus assumed, and what to do next.

- Built on branch `feat/landing-page`.
- Product-first onboarding plan for this session: `~/.claude/plans/twinkly-shimmying-cerf.md`.
- Live Supabase project: `ccohfxrjpnrherqflpxa`.

---

## 1. Status at a glance

| Area | State |
| --- | --- |
| Schema, RLS, RPC, storage | **Applied to the live project.** All four original migrations plus `20260823120000_onboarding_answers.sql` are live. |
| Public profile route + renderer | Done, verified rendering locally and via e2e |
| Nine blocks | Done |
| Theme system + 10 presets | Done, contrast-tested |
| Editor (canvas, outline, inspectors, autosave, undo) | Done |
| Auth (Google + email/password + **anonymous**) | Done. See §10 for the current provider config and why it's provisional. |
| Product-first onboarding (guest build → publish-gated account) | **Done and verified live**, see §10 |
| Uploads + quota + orphan sweep | Done |
| Publish / unpublish / preview / dashboard / share | Done |
| SEO, OG image, robots, sitemap | Done |
| Unit tests | 108 passing across 8 files |
| Playwright e2e | **Both specs pass live**: `core-loop.spec.ts` (signed-up flow) and `guest-onboarding.spec.ts` (new anonymous flow) |
| RLS integration tests | Written; not re-run this session (needs `OWNA_TEST_SUPABASE_*` env vars) |

`bun run build`, `bun run typecheck`, `bun run lint`, `bun run test` are all
green as of this session. `OWNA_E2E=1 bun run test:e2e` is green too.

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

**Product-first onboarding.** As of this session, a visitor can build and see
a fully curated page before ever creating an account. Publishing is the point
an account becomes required — see §10.

---

## 3. Next.js 16 things that will bite you

This is not the Next.js in most training data. All verified against
`node_modules/next/dist/docs/`.

- **`middleware.ts` is now `proxy.ts`** at the repo root, exporting `proxy`.
  Its matcher (`/dashboard`, `/editor`, `/settings`, `/onboarding`, `/preview`)
  only checks "is there a session" — it does not distinguish an anonymous
  session from a permanent one, and that turned out to be exactly right for
  the guest flow (see §10) rather than something that needed changing.
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
  pattern.

---

## 4. Architecture invariants

Break any of these and the design stops working. The first two are enforced by
`tests/unit/architecture.test.ts`.

1. **Block definitions are pure data.** `lib/blocks/definitions.ts` holds type,
   label, Zod schema and defaults — no React, no components. Imported by the
   editor, the public renderer, the save action, the onboarding template
   seeder (§10), and the tests.

2. **The public surface imports no editor code.** `components/public/**`,
   `app/[username]/**` and `components/icons/**` may not import editor-only
   modules or even `@/components/ui/*`.

3. **Block renderers are pure presentational components.** No `async`, no
   fetching. The server renders them for the public page and the editor
   renders *the same components* client-side for the live preview and the
   dashboard preview — "preview matches production" by construction.

4. **The public page reads exactly one row**, `profile_publications.snapshot`.

5. **Nothing trusts the client.** The publish snapshot is built in SQL by
   `publish_profile()` from `auth.uid()`'s own rows. This held up unchanged
   for the guest flow: an anonymous session's `auth.uid()` works identically
   to a permanent one everywhere in the schema, so no RLS/RPC change was
   needed to support it (see §10).

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
design (§10): every RLS policy scoped `to authenticated` — which is all of
them — already works for an anonymous session with zero changes. An anonymous
user is a real row in `auth.users` (`is_anonymous: true`), not a special case.

**`getUser()` is wrapped in React's `cache()`** (`lib/supabase/server.ts`) so
the several places in one request that each need to know "who is this" — a
page, a layout, a Server Action — share one token revalidation instead of
paying for it repeatedly.

---

## 6. What is proven, and what is not

**Verified this session, live against the real Supabase project:**
- All migrations apply cleanly, including the new `onboarding_answers` table.
- Both e2e specs pass: signed-up core loop, and the new anonymous
  build → publish-gate → account-creation → live-page loop.
- `mailer_autoconfirm` and the Email/Google/Anonymous provider toggles all
  confirmed via `GET /auth/v1/settings` (a read-only, unauthenticated
  endpoint — useful for verifying Auth config from a shell without a
  dashboard round trip).
- Production build succeeds with `cacheComponents: true`; `/onboarding/questionnaire`
  and `/editor` render as Partial Prerenders like their siblings.

**Not verified:**
- The Google `linkIdentity()` path in the publish gate (upgrading an
  anonymous session to a permanent one via Google) is implemented and
  typechecks, but was never driven through a real Google consent screen —
  no browser extension was available this session, and headless automation
  can't get through Google's real login. **Needs a manual click-through.**
- RLS integration tests (`tests/integration`) were not re-run this session.

**Ruled out this session:** a report of "Create your OWNA" landing on the old
`/onboarding/username` page and the dashboard instead of the new questionnaire
was traced to a stale session/cache in the reporter's browser tab from earlier
manual testing — confirmed by reproducing cleanly in an Incognito window. Not
a code issue; no fix needed. (Automated fresh-session e2e already covered this
path and passed throughout.)

---

## 7. Next steps, in order

1. **Manually verify the Google-linking path** in the publish gate.
2. **Decide the email-confirmation story before real users sign up.** The
   project currently has `mailer_autoconfirm: true` (confirmation off)
   because there is no SMTP configured and confirmation emails were failing
   outright (`500 Error sending confirmation email`) — this affected the
   *pre-existing* plain `/signup` too, not just the new flow. Either configure
   real SMTP and turn confirmation back on, or make peace with unconfirmed
   email signups long-term. Don't leave this as an accidental side effect of
   testing.
3. **Decide what happens to abandoned anonymous drafts** — a visitor who
   starts the questionnaire or builds a page and never creates an account
   leaves a real (harmless, but unbounded) row in `auth.users` /`profiles`.
   No cleanup job exists yet. Worth a scheduled sweep if volume grows.
4. **Run the RLS integration suite** against a scratch project:
   `OWNA_TEST_SUPABASE_URL=… OWNA_TEST_SUPABASE_PUBLISHABLE_KEY=… bun run test:integration`.
5. **Lighthouse a published profile.** Targets: Performance ≥ 95,
   Accessibility ≥ 95 on mobile.
6. **Deploy to Vercel**, set env vars (including the same Supabase project),
   confirm publishing invalidates the cache within seconds.

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
- **New this session:** no cleanup for abandoned anonymous accounts/drafts
  (see §7.3). No merge path if someone builds anonymously, then logs into a
  *different*, pre-existing account at the publish gate — the copy says the
  guest draft won't come with them, but nothing prevents them from trying, and
  the guest draft is simply orphaned under the anonymous user, not deleted.
- No analytics, no discovery, no remix, no marketplace, no AI — out of scope.

---

## 9. Product-first onboarding (earlier session)

> **Stale in places — see §10.** `/onboarding/username` no longer exists, the
> publish gate has changed, and §7.2's `mailer_autoconfirm` note is wrong
> (it is `false` live). §10 wins wherever the two disagree.

**Why:** every CTA used to route straight to `/signup` — a visitor had to
create a full account before touching the product at all. The new flow is
land → "Create your OWNA" → short questionnaire → land in the editor
pre-filled with a curated starting page → edit freely → **Publish is the
moment an account becomes required**, not before and not only as an
afterward nudge. Scoped to the free tier; pricing is future work.

**Architecture: Supabase anonymous auth**, not a client-only local draft.
`supabase.auth.signInAnonymously()` fires the moment a visitor clicks
"Create your OWNA" (`components/marketing/start-building-button.tsx`), before
they ever reach the questionnaire. Because anonymous sessions are real,
cookie-backed `auth.users` rows with Postgres role `authenticated` (see §5),
every existing RLS policy, RPC and Server Action worked immediately with zero
schema or policy changes — the only new schema is `onboarding_answers`, used
purely so a reload mid-questionnaire restores progress instead of losing it.

**Flow, end to end:**
1. `app/page.tsx` CTAs → `StartBuildingButton` → anonymous sign-in → `/onboarding/questionnaire`.
2. `app/onboarding/questionnaire/` — 3 steps (purpose, name, handle-with-live-check),
   each persisted immediately to `onboarding_answers` (`app/onboarding/questionnaire/actions.ts`).
3. On submit: `claim_username` RPC (shared helper `claimUsernameRpc`, factored
   out of `app/onboarding/actions.ts` so the original username-only onboarding
   step and the new questionnaire share the exact same claim/error-translation
   logic), then the draft is seeded from `templateForPurpose()`
   (`lib/demo-profiles.ts`) — the matched persona's **theme and layout and
   block-type structure**, but placeholder content via `starterBlockProps()`,
   never the demo personas' own literal copy (a real bug caught during
   testing: the first version put "Sarah Jenkins" verbatim on every new
   consultant-purpose user's hero block).
4. `/editor` — unchanged; autosave and the canvas work identically for an
   anonymous session.
5. **Publish gate** (`components/editor/publish-auth-gate.tsx`, wired into
   both `components/editor/toolbar.tsx` and `components/dashboard/publish-controls.tsx`):
   an anonymous user hitting Publish gets a dialog instead of publishing.
   "Create free account" calls `upgradeAnonymousAccount()`
   (`app/(auth)/actions.ts`, `supabase.auth.updateUser({email, password})`) —
   deliberately **not** `signUpWithPassword`, which would mint a second,
   unlinked user and orphan the draft. "Continue with Google" uses
   `linkIdentity()` client-side (needs "Manual linking" enabled in Supabase
   Auth settings), redirecting through `/auth/callback?next=/editor?publish=1`;
   the toolbar's `PublishResumeWatcher` picks the interrupted publish back up
   on return. Either way, the same `auth.uid()` carries the already-built
   profile/blocks straight through — no migration.

**Provider config required** (dashboard-only, not code — confirmed live this
session via `GET /auth/v1/settings`): Anonymous sign-ins on, Manual linking
on, Email and Google providers on. See §7.2 for the open `mailer_autoconfirm`
decision.

**New/changed files:** `supabase/migrations/20260823120000_onboarding_answers.sql`;
`app/onboarding/questionnaire/{page,actions,questionnaire-form}.tsx`;
`components/marketing/start-building-button.tsx`;
`components/editor/publish-auth-gate.tsx`; `lib/demo-profiles.ts` (extended
with `PURPOSE_OPTIONS`/`templateForPurpose`); `app/onboarding/actions.ts`
(extracted `claimUsernameRpc`); `app/(auth)/actions.ts` (added
`upgradeAnonymousAccount`); `components/editor/toolbar.tsx` and
`components/editor/editor-shell.tsx` (threaded `isAnonymous`,
`PublishResumeWatcher`); `app/(app)/editor/page.tsx` and
`app/(app)/dashboard/page.tsx` (pass `isAnonymous`); `lib/supabase/server.ts`
(`getUser()` wrapped in `cache()`); `tests/e2e/guest-onboarding.spec.ts` (new,
passes live).

---

## 10. Onboarding funnel: gap closure and redesign (2026-08-25)

Supersedes §9 wherever the two disagree, and corrects §6/§7.2 on
`mailer_autoconfirm`. §9 describes the guest path as it was first built; this
section describes the funnel as it now stands.

### 10.1 THE BLOCKER: outbound email is failing on the live project

**Email auth is broken in production right now.** Verified live this session
against `ccohfxrjpnrherqflpxa` with Playwright, on a clean build:

- `/signup` → `Error sending confirmation email`. The account is not created
  and the visitor cannot proceed.
- Guest → Publish → account gate → `Error sending email change email`.
  `updateUser()` fails as a whole, so the credentials are **not** attached and
  **the page never publishes**. The guest funnel dead-ends at its most
  important step.

This is not a code regression, and it is the real reason the e2e suite has
been red (the note blaming "provider config drift" was half right). Both
entrances to the product are affected; only Google OAuth still works.

Most likely cause, in order: (1) the Resend sending domain is unverified, which
restricts delivery to the Resend account owner's own address and rejects
everything else; (2) the SMTP credentials on the Supabase project are not
actually saved. **Check Resend → Domains, then Supabase → Project Settings →
Auth → SMTP.** Until this is fixed no amount of application code will make
email signup work.

The app now translates these into `"We couldn't send the confirmation email
just now. Try again in a moment, or continue with Google instead."`
(`friendlyAuthError` in `app/(auth)/actions.ts`) rather than showing the raw
string, but that is damage control, not a fix.

### 10.2 Live auth settings, confirmed

`GET /auth/v1/settings` (unauthenticated, needs the anon key as `apikey`):
`anonymous_users: true`, `email: true`, `google: true`,
**`mailer_autoconfirm: false`**. §7.2 describes an earlier session that set it
to `true`; it has since been flipped back. Confirmation emails are required and
on the critical path.

### 10.3 One onboarding path, not two

`/onboarding/username` **is deleted**, along with `claimUsername` and
`seedProfile`. Everything now routes through the questionnaire:
`/auth/callback` with no profile, the post-confirmation landing, and the
`!draft` fallbacks in editor/dashboard/preview/settings. `claimUsernameRpc`
survives as the shared helper. The Google-metadata seeding `seedProfile` did
now happens in `completeOnboarding`, and the questionnaire prefills its name
step from the same metadata.

Reason: signing up with email or Google produced a bare handle form and two
placeholder blocks, while a guest who never made an account got a templated
draft. The account-first user got the worse first run.

### 10.4 Email templates are load-bearing

`supabase/templates/{confirmation,recovery,email-change,magic-link}.html`,
wired into `supabase/config.toml` for local. Each links to
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…&next={{ .RedirectTo }}`.

Supabase's stock templates link to `/auth/v1/verify`, which **never reaches**
`app/auth/confirm/route.ts` — so with the default templates, that route and all
its `next` handling is dead code. Reverting a template to
`{{ .ConfirmationURL }}` silently breaks the post-confirmation redirect.

`{{ .RedirectTo }}` expands to a full URL, not a path, which is why
`safeNextTarget()` (`lib/validations/auth.ts`) exists alongside
`safeNextPath()`. It accepts same-origin absolute URLs and still refuses
everything else.

**MANUAL STEP, NOT DONE:** the hosted project keeps its own copies under
Auth → Emails. Editing the files in this repo does not update it. Paste all
four in, or the live flow keeps using the stock templates. No MCP tool exposes
auth config, and the Management API needs a PAT that is not in `.env.local`.

### 10.5 Rate limits

Resend free tier: 100/day, 3,000/month, 2/sec — and Supabase's own
`rate_limit_email_sent` sits in front of it. Every resend affordance goes
through `components/auth/resend-button.tsx`: 60s cooldown persisted per address
in `localStorage` (a reload is the obvious way to "retry", so an in-memory
timer would reward it), a hard cap of 3 attempts, and never a send on mount.
`seedCooldown` starts the clock for screens reached immediately after a send.

`[auth.rate_limit] email_sent` in `config.toml` is raised to 30 for **local**
Inbucket testing only. Do not read local headroom as production headroom.

### 10.6 Local config now matches production

`supabase/config.toml`: `enable_anonymous_sign_ins = true`,
`enable_confirmations = true`, and `site_url` moved from `http://127.0.0.1:3000`
to `http://localhost:3000` (Supabase matches redirect allow-list entries
exactly, and the dev server plus Playwright both use the hostname). Previously
the guest CTA, the confirmation banner, `email_not_confirmed` handling and
`resendConfirmation` were all unreachable against a local stack.

### 10.7 What was fixed, in one list

- Marketing header was session-blind — a logged-in user still saw "Log in".
  Now `components/marketing/header-auth-slot.tsx`, an async server component in
  its own `<Suspense>` so `/` stays partially prerendered. Three states keyed on
  profile presence, not `is_anonymous` (nearly every visitor has *some* session).
  `MobileNav` takes the resolved state as a prop.
- `/login` and `/signup` had no signed-in guard. `app/(auth)/auth-screen.tsx`
  redirects a member, and *warns* a guest sitting on an unpublished draft
  rather than silently stranding it.
- Every `?error=` code the auth routes emit was dropped on the floor.
  `lib/auth/errors.ts` + a new `components/ui/alert.tsx`; an expired link now
  explains itself and offers a fresh one.
- **No password reset existed at all.** `/forgot-password`,
  `/forgot-password/sent`, `/reset-password`, plus `requestPasswordReset` /
  `resendPasswordReset` / `updatePassword`. Neutral responses throughout, so the
  form is not an account-existence oracle.
- `/signup/check-email` was a dead end: no resend, no way to fix a typo.
- `resendConfirmation` hardcoded `type: "email_change"`. It now picks from
  `user.new_email ?? user.email` — Supabase parks an `updateUser()` address in
  `new_email` and a `signUp()` one in `email`, and the wrong type fails silently.
- Registered-email collision at the publish gate showed a raw Supabase string
  with no way out. The gate now has an `email-taken` view offering both choices.
- `next` was posted by the signup form and ignored by the action.
- Banner and gate predicates were written separately at each call site. Both now
  come from `lib/auth/session.ts` — moved out of `lib/supabase/server.ts`
  because `server-only` made two pure functions untestable and unusable from a
  client component. `server.ts` re-exports them.
- **`Skeleton` was invisible in light mode.** `--muted` and `--background` are
  both `#F7F6F2`, so every loading state in the app rendered as blank space.
  Now tinted from `foreground`.

### 10.8 The redesign

- `components/onboarding/onboarding-shell.tsx` — two panes above `lg`,
  questions left, live preview right. The preview drops out below `lg` rather
  than stacking; a preview too small to read is worse than none.
- `components/onboarding/live-preview.tsx` + `lib/onboarding/preview-snapshot.ts`
  — mounts the real `ProfileRenderer`. An 840px stage at `scale-50` with
  `origin-top-left` lands at exactly 420px; the full width has to be real
  because the blocks are container-query driven and would otherwise re-flow to
  mobile. **It shows curated demo content, not what gets seeded** —
  `starterBlockProps` is near-empty by design and previewed as a blank page.
  The caption says "Example content in this style" and that labelling is
  load-bearing; do not quietly reword it.
- Purpose cards carry each template's real `theme.colors`, read from the same
  source that seeds the draft.
- `components/editor/publish-success-dialog.tsx` — first publish only, gated on
  `hasEverPublished` threaded from the server. Re-publishes keep the toast.
- `components/dashboard/activation-checklist.tsx` + `lib/onboarding/activation.ts`
  — derived from the draft's real contents, never a stored "completed steps"
  list, and hides itself once complete.
- `components/auth/password-input.tsx` — the gate asks people to invent a
  password inside a modal in about four seconds.

### 10.9 Verification status

- `typecheck`, `lint`, `build` clean. 135 unit tests pass (27 new in
  `tests/unit/onboarding.test.ts`).
- `tests/e2e/account-first.spec.ts` (new, 4 tests) **passes live**: check-email
  screen, expired link, malformed link, guest-draft login warning.
- `core-loop.spec.ts` and `guest-onboarding.spec.ts` **fail at the publish
  gate** solely because of §10.1. Both were rewritten for the questionnaire
  path and are correct; they cannot pass until email delivery works.
- Not verified: Google `linkIdentity()` (still needs a human at a consent
  screen), and the confirmation link end to end (needs a deliverable inbox).

### 10.10 Vercel checks for next session

The Vercel MCP was not connected this session. When it is, confirm:
1. `NEXT_PUBLIC_SITE_URL` is set on production — `siteUrl()` otherwise falls
   back to `VERCEL_URL`, and every confirmation/recovery link is built from it.
2. Every origin it can produce is in the Supabase redirect allow-list, preview
   deployments included, or OAuth and email links break there only.
3. The four email templates are pasted into Auth → Emails (§10.4).
4. Resend domain verification (§10.1) before announcing anything.
