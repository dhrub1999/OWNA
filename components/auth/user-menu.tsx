"use client";

import Link from "next/link";
import { ExternalLink, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";

/**
 * The account dropdown behind every signed-in avatar — marketing header,
 * mobile nav and the dashboard header all render the same menu so the
 * available actions never drift between them.
 */
export function UserMenu({
  avatarUrl,
  displayName,
  liveUrl,
  avatarSize = "default",
  align = "end",
}: {
  avatarUrl: string | null;
  displayName: string | null;
  /** The profile's public URL, or null when nothing has been published yet. */
  liveUrl: string | null;
  avatarSize?: "default" | "sm" | "lg";
  align?: "start" | "center" | "end";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="cursor-pointer rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <UserAvatar avatarUrl={avatarUrl} name={displayName} size={avatarSize} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings /> Settings
        </DropdownMenuItem>
        {liveUrl ? (
          <DropdownMenuItem
            render={
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLink /> Visit live site
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
