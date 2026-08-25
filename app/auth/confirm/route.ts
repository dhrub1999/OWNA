import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextTarget } from "@/lib/validations/auth";

/** Email confirmation and password-recovery links. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // `safeNextTarget`, not `safeNextPath`: our templates pass `{{ .RedirectTo }}`
  // here, which Supabase expands to a full URL rather than a path.
  const next = safeNextTarget(searchParams.get("next"), origin);

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=expired_link`);
  }

  // A recovery link has to end at the form that sets a new password. It arrives
  // with a live session, so anywhere else would look like a successful sign-in
  // and leave the old password in place — the one outcome the person clicking
  // it definitely did not want.
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}${next ?? "/reset-password"}`);
  }

  // Default to the dashboard rather than onboarding: it already forwards to the
  // questionnaire when there is no draft, so this covers both the brand-new
  // account and the guest who just confirmed an address on a profile they built
  // an hour ago — without making the second one watch a redirect they don't
  // need.
  return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
}
