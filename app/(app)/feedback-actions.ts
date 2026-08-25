"use server";

import { feedbackSchema } from "@/lib/validations/feedback";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/supabase/profile";

export type FeedbackResult = { ok: true } | { ok: false; message: string };

/**
 * The name attached to feedback is read from the caller's own profile, never
 * from the form — this is the same page name they wrote in the questionnaire,
 * and there is no reason to ask a second time or trust a client-supplied one.
 */
export async function submitFeedback(input: {
  message: string;
  heardAbout?: string;
}): Promise<FeedbackResult> {
  const user = await requireUser();

  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid feedback." };
  }

  const profile = await getOwnProfile();
  const profileName = profile?.display_name || profile?.username || null;

  const supabase = await createClient();
  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    profile_name: profileName,
    message: parsed.data.message,
    heard_about: parsed.data.heardAbout ?? null,
  });

  if (error) {
    return { ok: false, message: "Couldn't send that. Try again?" };
  }

  return { ok: true };
}
