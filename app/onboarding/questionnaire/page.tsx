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

  return (
    <QuestionnaireForm
      initialAnswers={(draft?.answers as Record<string, string> | null) ?? {}}
    />
  );
}

export default function QuestionnairePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex flex-col gap-5">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-2/3" />
            </div>
          }
        >
          <Questionnaire />
        </Suspense>
      </div>
    </main>
  );
}
