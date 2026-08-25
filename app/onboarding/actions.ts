"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/**
 * Claiming a username is the moment an account becomes a profile.
 *
 * The database does the work in one transaction (`public.claim_username`), so
 * a profile can never exist without its home page. This module's job is to
 * validate and translate the failure modes into something a person can read.
 *
 * There used to be a second entry point here — a bare username form at
 * `/onboarding/username` for people who signed up with an email or with Google,
 * seeding two placeholder blocks. It produced a visibly worse first run than
 * the guest path's templated draft, for no reason other than the order the two
 * were built in. Every path now goes through the questionnaire, so only the
 * shared RPC wrapper survives.
 */

export type ClaimResult = { error: string };

/**
 * Call `claim_username` and translate its failure modes into copy a person can
 * read. Used by `app/onboarding/questionnaire/actions.ts`, which claims a name
 * as one step of a bigger form rather than as the whole submission.
 */
export async function claimUsernameRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string,
): Promise<{ profile: Tables<"profiles"> } | { error: string }> {
  // The function returns a composite, not a set, so there is no .single() here.
  const { data: profile, error } = await supabase.rpc("claim_username", {
    p_username: username,
  });

  if (error || !profile) {
    // 23505 is the unique index firing. The availability check the form ran a
    // moment ago is advisory — the index is what actually decides, and losing
    // that race is a normal outcome, not an exception.
    const taken =
      error?.code === "23505" || error?.message?.includes("not available");
    return {
      error: taken
        ? "Someone just took that one. Try another."
        : "Couldn't claim that name. Try again.",
    };
  }

  return { profile };
}
