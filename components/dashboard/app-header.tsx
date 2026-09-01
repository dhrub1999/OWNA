import { Suspense } from "react";
import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getViewer } from "@/lib/auth/viewer";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-3 border-b px-4 sm:px-6">
      <Link
        href="/dashboard"
        aria-label="OWNA dashboard"
        className="text-foreground hover:text-logo-hover transition-colors"
      >
        <Logo className="h-6 w-auto" />
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="size-6 animate-pulse rounded-full bg-muted"
            />
          }
        >
          <HeaderAccountMenu />
        </Suspense>
      </div>
    </header>
  );
}

/**
 * The only part of `AppHeader` that reads cookies (via `getViewer`), so it is
 * isolated in its own Suspense boundary the same way `HeaderAuthSlot` is on
 * the marketing header — otherwise the whole header would need to wait on a
 * database round trip just to show the logo and theme toggle.
 */
async function HeaderAccountMenu() {
  const viewer = await getViewer();
  if (viewer.state === "signed-out") return null;

  return (
    <UserMenu
      avatarSize="sm"
      avatarUrl={viewer.avatarUrl}
      displayName={viewer.displayName}
      liveUrl={viewer.liveUrl}
    />
  );
}
