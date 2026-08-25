import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getOwnProfile } from "@/lib/supabase/profile";
import { createClient, getUser } from "@/lib/supabase/server";
import { QuestionnaireForm } from "./questionnaire-form";

export const metadata: Metadata = { title: "Create your OWNA" };

/**
 * Reading the session and any in-progress answers is request-time work, so it
 * sits behind a Suspense boundary the same way the username-only onboarding
 * step does.
 */
async function Questionnaire() {
  const user = await getUser();
  if (!user) redirect("/login?next=/onboarding/questionnaire");

  // Landing here with a profile already claimed means a stale tab or a back
  // button — same guard as the username-only step.
  const profile = await getOwnProfile();
  if (profile) redirect("/dashboard");

  const supabase = await createClient();
  const { data: draft } = await supabase
    .from("onboarding_answers")
    .select("answers")
    .eq("user_id", user.id)
    .maybeSingle();

  const saved = (draft?.answers as Record<string, string> | null) ?? {};

  // Someone arriving from Google has already told us their name once. Asking
  // again with an empty box is the kind of small insult that makes a signup
  // feel like paperwork — a saved answer still wins, since they typed it.
  const metadata = user.user_metadata ?? {};
  const suggestedName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : "";

  return (
    <QuestionnaireForm
      initialAnswers={{ name: suggestedName, ...saved }}
    />
  );
}

/**
 * The form brings its own full-bleed two-pane shell, so this page is only a
 * Suspense boundary. The skeleton mirrors that shell rather than the old
 * centred card, so nothing jumps sideways when the session read lands.
 */
export default function QuestionnairePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex min-h-[100dvh] flex-col lg:flex-row">
            <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:max-w-[52%] lg:px-16 lg:py-12">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="mt-6 h-1 w-full" />
              <div className="flex flex-1 items-center py-10">
                <div className="flex w-full max-w-md flex-col gap-5">
                  <Skeleton className="h-9 w-3/4" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              </div>
            </div>
            <div className="bg-muted/40 hidden flex-1 border-l lg:block" />
          </div>
        }
      >
        <Questionnaire />
      </Suspense>
    </main>
  );
}
