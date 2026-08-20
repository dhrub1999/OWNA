import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-3 border-b px-4 sm:px-6">
      <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
        OWNA
      </Link>
      <div className="ml-auto flex items-center gap-1">
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
