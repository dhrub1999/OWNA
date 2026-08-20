import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/supabase/profile";
import { suggestUsername } from "@/lib/validations/username";
import { UsernameForm } from "./username-form";

export const metadata: Metadata = { title: "Pick your username" };

/**
 * Reading the session is request-time work, so it sits behind a Suspense
 * boundary. Everything above it — the heading and the explanation — is in the
 * prerendered shell and paints immediately, and only the input waits on the
 * round trip that produces a suggested handle.
 */
async function ClaimForm() {
  const [user, profile] = await Promise.all([getUser(), getOwnProfile()]);

  if (!user) redirect("/login?next=/onboarding/username");
  // Usernames are changed in settings, not here. Landing on this page with a
  // profile already claimed means a stale tab or a back button.
  if (profile) redirect("/dashboard");

  const seed =
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "") ||
    user.email ||
    "";

  return <UsernameForm initialValue={suggestUsername(seed)} />;
}

export default function UsernamePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pick your username
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This is your address on the internet. You can change it later.
        </p>
        <div className="mt-8">
          <Suspense
            fallback={
              <div className="flex flex-col gap-5">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            }
          >
            <ClaimForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
