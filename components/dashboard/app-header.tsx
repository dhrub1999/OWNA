import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-3 border-b px-4 sm:px-6">
      <Link href="/dashboard" aria-label="OWNA dashboard">
        <Image
          src="/assets/logo/logo-with-name.svg"
          alt="OWNA"
          width={90}
          height={32}
          priority
          className="theme-logo"
        />
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
