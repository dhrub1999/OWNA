import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { HeaderAuthRefresh } from "@/components/marketing/header-auth-refresh";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { getViewer, type Viewer } from "@/lib/auth/viewer";

/**
 * The right-hand end of the marketing header, resolved against the session.
 *
 * This is the only part of the marketing chrome that reads cookies, and it is
 * rendered inside its own `<Suspense>` boundary by `SiteHeader`. That placement
 * is load-bearing under Cache Components: a `cookies()` read anywhere else in
 * the tree would drag the whole prerendered landing page into dynamic
 * rendering. Everything outside this component stays static.
 *
 * One accepted imprecision: `proxy.ts` does not match `/`, so no refresh runs
 * here and a Server Component cannot write the rotated cookie back anyway. A
 * session whose access token expired mid-visit can therefore render as
 * signed-out on the very first paint. `HeaderAuthRefresh` corrects that
 * client-side once the browser's own Supabase client confirms the session is
 * still good, so it never survives past the initial render.
 *
 * That correction — and the loading-fallback-to-resolved swap on a normal
 * load — can still visibly nudge `ThemeToggle`, since the signed-out pair and
 * the member avatar are very different widths sharing one flex row. An
 * earlier version of this file reserved a fixed-width box to kill that
 * motion entirely, but that left a permanent empty gap next to the avatar on
 * every load, which is worse than the rare, brief nudge it prevented. Content
 * sizes to itself instead.
 */
export async function HeaderAuthSlot() {
  const viewer = await getViewer();

  return (
    <>
      <HeaderAuthRefresh signedOut={viewer.state === "signed-out"} />
      <DesktopActions viewer={viewer} />
      <MobileNav viewer={viewer} />
    </>
  );
}

function DesktopActions({ viewer }: { viewer: Viewer }) {
  if (viewer.state === "member") {
    return (
      <div className="hidden sm:inline-flex">
        <UserMenu
          avatarUrl={viewer.avatarUrl}
          displayName={viewer.displayName}
          liveUrl={viewer.liveUrl}
        />
      </div>
    );
  }

  if (viewer.state === "guest-draft") {
    return (
      <>
        {/* Still offered, because someone genuinely may have an account they
            built this draft before remembering. `/login` carries the warning
            about what that costs — the choice is theirs, informed. */}
        <Link
          href="/login"
          className="hidden text-sm font-medium transition-colors hover:text-primary sm:block"
        >
          Log in
        </Link>
        <Button
          className="hidden rounded-full px-6 sm:inline-flex"
          render={<Link href="/editor" />}
        >
          Continue building
        </Button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="hidden text-sm font-medium transition-colors hover:text-primary sm:block"
      >
        Log in
      </Link>
      <StartBuildingButton className="hidden rounded-full px-6 sm:inline-flex">
        Create your OWNA
      </StartBuildingButton>
    </>
  );
}

/**
 * What the header shows before the session read resolves.
 *
 * Deliberately not a "Log in" link: rendering the signed-out state and then
 * swapping it for "Dashboard" is the same bug this component exists to fix,
 * just compressed into 200ms. A neutral placeholder of roughly the right size
 * keeps the header from reflowing without ever asserting anything false.
 */
export function HeaderAuthSlotFallback() {
  return (
    <>
      <div
        aria-hidden="true"
        className="hidden h-9 w-40 animate-pulse rounded-full bg-muted sm:block"
      />
      <MobileNav viewer={{ state: "signed-out" }} />
    </>
  );
}
