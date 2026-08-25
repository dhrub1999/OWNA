import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  HeaderAuthSlot,
  HeaderAuthSlotFallback,
} from "@/components/marketing/header-auth-slot";
import { NAV_LINKS } from "@/components/marketing/nav-links";

/**
 * The marketing header, shared by the landing page and the legal/contact pages.
 *
 * Sticky, because the nav is now entirely in-page anchors — a nav that scrolls
 * away is a nav you can only use from the top of the document.
 *
 * The translucent fill is progressive: the opaque `bg-background` is the
 * fallback, and the translucent value only applies where `backdrop-filter`
 * actually exists, so the header never turns into a smear of unreadable text on
 * a browser that ignores the blur.
 *
 * The header itself reads no request data, so it stays in the prerendered
 * shell. Only `HeaderAuthSlot` touches cookies, and it is isolated behind its
 * own Suspense boundary for exactly that reason.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background supports-backdrop-filter:bg-background/72 supports-backdrop-filter:backdrop-blur-xl supports-backdrop-filter:backdrop-saturate-150">
      <div className="flex h-20 items-center justify-between px-6 sm:px-12">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            aria-label="OWNA home"
            className="text-foreground transition-colors hover:text-logo-hover"
          >
            <Logo className="h-9 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Suspense fallback={<HeaderAuthSlotFallback />}>
            <HeaderAuthSlot />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
