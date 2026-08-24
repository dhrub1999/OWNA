import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-3 border-b px-4 sm:px-6">
      <Link
        href="/dashboard"
        aria-label="OWNA dashboard"
        className="text-foreground hover:text-logo-hover transition-colors"
      >
        <Logo className="h-8 w-auto" />
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/settings" />}
          aria-label="Settings"
        >
          <Settings />
        </Button>
        <form action={signOut}>
          <Button variant="ghost" size="icon-sm" type="submit" aria-label="Sign out">
            <LogOut />
          </Button>
        </form>
      </div>
    </header>
  );
}
