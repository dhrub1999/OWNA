"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { PURPOSE_OPTIONS, templateForPurpose, type DemoProfileId } from "@/lib/demo-profiles";
import { createClient, requireUser } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/validations/username";
import type { Json } from "@/types/database";
import { claimUsernameRpc, type ClaimResult } from "../actions";

/**
 * The pre-account onboarding path: a questionnaire instead of a bare username
 * form, ending with a draft seeded from a curated template instead of two
 * generic placeholder blocks. The visitor is already signed in anonymously by
 * the time any of this runs (see the landing page's CTA), so `requireUser()`
 * passes exactly as it does for a permanent account.
 */

const purposeIds = PURPOSE_OPTIONS.map((option) => option.id) as [
  DemoProfileId,
  ...DemoProfileId[],
];

const answersSchema = z.object({
  purpose: z.enum(purposeIds),
  name: z.string().trim().min(1, "Enter a name").max(80),
  username: usernameSchema,
});

/**
 * Upsert one step's worth of answers so a reload restores exactly where the
 * visitor left off. Best-effort: a failed save here should never block moving
 * to the next question, only cost the visitor their progress if they reload.
 */
export async function saveOnboardingAnswers(
  partial: Record<string, string>,
): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("onboarding_answers")
    .select("answers")
    .eq("user_id", user.id)
    .maybeSingle();

  const answers = {
    ...((existing?.answers as Record<string, string> | null) ?? {}),
    ...partial,
  };

  await supabase.from("onboarding_answers").upsert({ user_id: user.id, answers });
}

export async function completeOnboarding(formData: FormData): Promise<ClaimResult> {
  await requireUser();

  const parsed = answersSchema.safeParse({
    purpose: formData.get("purpose"),
    name: formData.get("name"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your answers and try again.",
    };
  }

  const supabase = await createClient();
  const claimed = await claimUsernameRpc(supabase, parsed.data.username);
  if ("error" in claimed) return claimed;

  const { profile } = claimed;
  const template = templateForPurpose(parsed.data.purpose);

  await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.name,
      theme: template.theme,
      layout: template.layout,
    })
    .eq("id", profile.id);

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("is_home", true)
    .maybeSingle();

  if (page) {
    await supabase.from("blocks").insert(
      template.blocks.map((block, index) => ({
        page_id: page.id,
        type: block.type,
        position: index,
        props: block.props as Json,
        style: block.style as Json,
      })),
    );
  }

  await supabase.from("onboarding_answers").delete().eq("user_id", profile.user_id);

  redirect("/editor");
}
