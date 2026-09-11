"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { NAV_LINKS } from "@/components/marketing/nav-links";
import { Logo } from "@/components/logo";
import type { Viewer } from "@/lib/auth/viewer";

/**
 * The header's navigation below `nav` (880px).
 *
 * The desktop nav is `hidden nav:flex`, which left small screens with no
 * navigation at all — the anchors, the log-in link and the whole site map were
 * simply absent. This restores them.
 *
 * Open state is local and explicit rather than left to the primitive: every
 * item in here navigates, and a sheet that stays open behind an in-page anchor
 * jump would cover the section it just scrolled to.
 *
 * `viewer` arrives as a prop rather than being read here, because this is a
 * client component and the session read has to stay on the server inside the
 * header's Suspense boundary. It must match the desktop actions — a header that
 * says "Dashboard" over a drawer that says "Log in" is the same bug twice.
 */
export function MobileNav({ viewer }: { viewer: Viewer }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="nav:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[86%] max-w-sm gap-0 bg-background p-0"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        <div className="flex h-20 items-center px-6">
          <Link
            href="/"
            aria-label="OWNA home"
            onClick={() => setOpen(false)}
            className="text-foreground transition-colors hover:text-logo-hover"
          >
            <Logo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Divided rows rather than a stack of cards: this is a list of
            destinations, and a border carries that without adding surfaces. */}
        <nav className="flex flex-col border-y border-border">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: `${i * 20}ms` }}
              className="flex items-center justify-between border-b border-border px-6 py-5 font-display text-2xl font-bold tracking-tight transition-colors last:border-b-0 hover:bg-secondary active:bg-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 p-6">
          {viewer.state === "member" ? (
            <>
              <div className="flex items-center gap-3 px-1 pb-1">
                <UserAvatar
                  avatarUrl={viewer.avatarUrl}
                  name={viewer.displayName}
                />
                <span className="truncate text-sm font-medium">
                  {viewer.displayName ?? "Your account"}
                </span>
              </div>
              <Button
                className="h-13 w-full rounded-full text-base font-semibold"
                render={
                  <Link href="/dashboard" onClick={() => setOpen(false)} />
                }
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="h-13 w-full rounded-full border border-border text-base font-medium"
                render={
                  <Link href="/settings" onClick={() => setOpen(false)} />
                }
              >
                Settings
              </Button>
              {viewer.liveUrl ? (
                <Button
                  variant="ghost"
                  className="h-13 w-full rounded-full border border-border text-base font-medium"
                  render={
                    <a
                      href={viewer.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                    />
                  }
                >
                  Visit live site
                </Button>
              ) : null}
              <Button
                variant="ghost"
                className="h-13 w-full rounded-full text-base font-medium text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
              >
                Log out
              </Button>
            </>
          ) : viewer.state === "guest-draft" ? (
            <>
              <Button
                className="h-13 w-full rounded-full text-base font-semibold"
                render={<Link href="/editor" onClick={() => setOpen(false)} />}
              >
                Continue building
              </Button>
              <Button
                variant="ghost"
                className="h-13 w-full rounded-full border border-border text-base font-medium"
                render={<Link href="/login" onClick={() => setOpen(false)} />}
              >
                Log in
              </Button>
            </>
          ) : (
            <>
              <StartBuildingButton className="h-13 w-full rounded-full text-base font-semibold">
                Create your OWNA
              </StartBuildingButton>
              <Button
                variant="ghost"
                className="h-13 w-full rounded-full border border-border text-base font-medium"
                render={<Link href="/login" onClick={() => setOpen(false)} />}
              >
                Log in
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
