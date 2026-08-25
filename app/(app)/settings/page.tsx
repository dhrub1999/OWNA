import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/dashboard/app-header";
import { UsernameSettings } from "@/components/dashboard/username-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { getOwnProfile } from "@/lib/supabase/profile";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

async function SettingsBody() {
  const [user, profile] = await Promise.all([getUser(), getOwnProfile()]);
  if (!profile) redirect("/onboarding/questionnaire");

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Your address</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Changing this breaks the old link. Anyone who saved it will get a 404.
        </p>
        <div className="mt-4">
          <UsernameSettings current={profile.username} />
        </div>
      </section>

      <section className="mt-10 border-t pt-8">
        <h2 className="text-sm font-semibold">Account</h2>
        <dl className="mt-3 text-sm">
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-muted-foreground">Joined</dt>
            <dd>
              {new Date(profile.created_at).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </dd>
          </div>
        </dl>
        <p className="text-muted-foreground mt-4 text-xs">
          Everything else — bio, photo, theme, what’s public — lives in the
          editor’s Page tab, next to the page it changes.
        </p>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <AppHeader />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-12">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="mt-8 h-24 w-full" />
          </div>
        }
      >
        <SettingsBody />
      </Suspense>
    </>
  );
}
