"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import {
  emailSchema,
  passwordSchema,
  safeNextPath,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

/**
 * Email/password auth.
 *
 * Both actions re-validate their input server-side. The matching client schemas
 * exist for inline errors only — a Server Action is a public endpoint and has
 * to assume the form was never rendered.
 */

export type AuthResult = { error: string } | undefined;

/**
 * Where a confirmation or recovery link should ultimately land.
 *
 * Supabase interpolates this whole URL into `{{ .RedirectTo }}`, and our email
 * templates hang it off `/auth/confirm` as `next`. It must be an exact match
 * for an entry in the project's redirect allow-list, which is why it is built
 * from `siteUrl()` rather than from request headers — a preview deployment and
 * production disagree about the host, and only `siteUrl()` knows which is which.
 */
function redirectUrl(path: string) {
  return `${siteUrl()}${path}`;
}

/**
 * Supabase's error strings are written for developers reading a stack trace.
 *
 * Only the cases a person can actually act on get rewritten; anything
 * unrecognised falls through unchanged rather than being flattened into a
 * useless "something went wrong", which would be worse than the raw string.
 */
function friendlyAuthError(error: AuthError): string {
  // Delivery failures arrive as a generic `unexpected_failure` whose message is
  // the only thing identifying them ("Error sending confirmation email",
  // "Error sending email change email"). They are worth catching by message
  // because the raw string reads as an application crash, when in fact the
  // account details were fine and the SMTP sender was not — and because the
  // visitor has a real alternative in Google that the raw string never offers.
  if (/error sending .*email/i.test(error.message)) {
    return "We couldn't send the confirmation email just now. Try again in a moment, or continue with Google instead.";
  }

  switch (error.code) {
    case "email_exists":
    case "user_already_exists":
      return "That email already has an account.";
    case "over_email_send_rate_limit":
      return "Too many emails sent just now. Wait a minute and try again.";
    case "over_request_rate_limit":
      return "Too many attempts. Give it a minute and try again.";
    case "weak_password":
      return "That password is too easy to guess. Try a longer one.";
    case "same_password":
      return "That's already your password. Pick a different one.";
    case "validation_failed":
      return "Check your details and try again.";
    default:
      return error.message;
  }
}

export async function signInWithPassword(
  formData: FormData,
): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Unconfirmed email is called out specifically: the credentials are
    // correct, so "don't match" would send someone chasing a typo that
    // isn't there. This does confirm the address has an account, which
    // "no such user" vs "wrong password" deliberately does not — an
    // accepted trade-off since the alternative is a user stuck with no way
    // to tell why sign-in keeps failing.
    if (error.code === "email_not_confirmed") {
      return { error: CONFIRM_EMAIL_MESSAGE };
    }
    if (error.code === "over_request_rate_limit") {
      return { error: friendlyAuthError(error) };
    }
    // signInWithPassword looks the caller up by auth.users.email, which
    // never gets populated for an anonymous session upgraded via
    // upgradeAnonymousAccount until its confirmation link is clicked — the
    // address sits in email_change in the meantime. GoTrue can't find a row
    // at all in that state, so it returns the exact same invalid_credentials
    // it would for a genuine wrong password, and this address would fail to
    // sign in no matter what password was typed. email_pending_confirmation
    // is true only in that provably-not-a-typo case (see its migration
    // comment), so surfacing "don't match" here would send someone hunting
    // for a mistake that isn't theirs.
    const pending = await supabase.rpc("email_pending_confirmation", {
      check_email: parsed.data.email,
    });
    if (pending.data) {
      return { error: CONFIRM_EMAIL_MESSAGE };
    }
    return { error: "That email and password don't match." };
  }

  redirect(safeNextPath(formData.get("next") as string) ?? "/dashboard");
}

const CONFIRM_EMAIL_MESSAGE =
  "Confirm your email before signing in — check your inbox for the link we sent.";

export async function signUpWithPassword(
  formData: FormData,
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const next = safeNextPath(formData.get("next") as string);
  const destination = next ?? "/onboarding/questionnaire";

  const supabase = await createClient();

  // signUp() only conflicts with an address already sitting in some row's
  // `email` column — not one parked in `email_change` by an anonymous
  // upgrade still awaiting confirmation (see email_claimed's migration
  // comment). Unchecked, that produces a second, unrelated account sharing
  // the address, and the first one's confirmation link breaks when it later
  // tries to claim an email `email` already holds elsewhere.
  const claimed = await supabase.rpc("email_claimed", {
    check_email: parsed.data.email,
  });
  if (claimed.data) {
    return { error: "That email already has an account." };
  }

  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: redirectUrl(destination) },
  });

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  // With email confirmation on, signUp returns a user but no session. Sending
  // them to the editor would just bounce off the proxy.
  if (!data.session) {
    const params = new URLSearchParams({ email: parsed.data.email });
    if (next) params.set("next", next);
    redirect(`/signup/check-email?${params}`);
  }

  // Everyone lands in the questionnaire, not the bare username form: it is the
  // only path that seeds a draft from a template rather than two placeholder
  // blocks, and a direct signup deserves the same first run as a guest.
  redirect(destination);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export type UpgradeResult =
  | { ok: true; pendingConfirmation: boolean }
  | { ok: false; error: string; emailTaken?: boolean };

/**
 * Attach real credentials to the caller's current session instead of creating
 * a new one.
 *
 * Used by the editor's publish-time auth gate: a visitor who has been
 * building anonymously calls this rather than `signUpWithPassword`, because
 * `signUp()` would mint a second, unlinked user and orphan the profile/blocks
 * already sitting under the anonymous one. `updateUser()` keeps the same
 * `auth.uid()`, so everything they built carries over with no migration.
 *
 * Does not redirect — the caller (the publish flow) resumes what it was doing
 * once this resolves. Publishing itself doesn't require the email to be
 * confirmed (the session is valid either way), so `pendingConfirmation` is
 * informational for the caller to surface, not a reason to block.
 */
export async function upgradeAnonymousAccount(
  formData: FormData,
): Promise<UpgradeResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const supabase = await createClient();

  // updateUser() itself won't complain about this — Supabase doesn't reserve
  // an address on write, only once its confirmation link is clicked — so an
  // unchecked call here would silently attach credentials that can never be
  // confirmed (the address already belongs, or is already pending, elsewhere)
  // while quietly orphaning this draft. See email_claimed's migration comment.
  const claimed = await supabase.rpc("email_claimed", {
    check_email: parsed.data.email,
  });
  if (claimed.data) {
    return {
      ok: false,
      error: "That email already has an account.",
      emailTaken: true,
    };
  }

  const { data, error } = await supabase.auth.updateUser(parsed.data, {
    emailRedirectTo: redirectUrl("/dashboard"),
  });

  if (error) {
    // Flagged separately so the gate can offer a way out instead of leaving
    // someone re-typing an address that will never be accepted. Their draft is
    // still under the anonymous session at this point — nothing is lost yet,
    // and that is exactly what makes the recovery choice worth presenting.
    const emailTaken =
      error.code === "email_exists" || error.code === "user_already_exists";
    return { ok: false, error: friendlyAuthError(error), emailTaken };
  }

  return { ok: true, pendingConfirmation: !data.user?.email_confirmed_at };
}

/**
 * Re-sends the confirmation email for the caller's own address.
 *
 * The type is chosen from the user record rather than hardcoded. Supabase
 * parks a not-yet-confirmed address in `new_email` when it arrived through
 * `updateUser()` — which is the anonymous-conversion path the publish gate
 * uses — and leaves it in `email` when it arrived through `signUp()`. Sending
 * the wrong type does not error, it just quietly delivers nothing, so keying
 * off which field actually holds the pending address is the difference between
 * a working button and one that lies.
 */
export async function resendConfirmation(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pendingEmail = user?.new_email ?? user?.email;
  if (!pendingEmail) {
    return { error: "No email to confirm." };
  }

  const { error } = await supabase.auth.resend({
    type: user?.new_email ? "email_change" : "signup",
    email: pendingEmail,
    options: { emailRedirectTo: redirectUrl("/dashboard") },
  });

  if (error) {
    return { error: friendlyAuthError(error) };
  }
}

/**
 * Re-send a signup confirmation to an address with no session behind it.
 *
 * The counterpart to `resendConfirmation`, for the check-your-email screen:
 * signing up with confirmations on leaves the visitor holding a promise and no
 * session at all, so there is no `getUser()` to read the address from. It has
 * to come from the form.
 *
 * Succeeds silently for an address that has no pending confirmation, for the
 * same reason `requestPasswordReset` does — this endpoint is unauthenticated,
 * and a truthful answer would make it an account checker.
 */
export async function resendSignupConfirmation(
  formData: FormData,
): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: redirectUrl("/onboarding/questionnaire") },
  });

  if (error?.code === "over_email_send_rate_limit") {
    return { error: friendlyAuthError(error) };
  }
}

/**
 * Start a password reset.
 *
 * Always reports success. Answering "no account with that address" here would
 * turn the form into an oracle for checking whether someone has an OWNA, and
 * the honest version helps a typo'd address no more than the neutral one does —
 * either way, nothing arrives.
 */
async function sendPasswordReset(formData: FormData): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: redirectUrl("/reset-password"),
  });

  // Rate limiting is the one failure worth surfacing: it is about this request,
  // not about whether the account exists, so it leaks nothing.
  if (error?.code === "over_email_send_rate_limit") {
    return { error: friendlyAuthError(error) };
  }
}

export async function requestPasswordReset(
  formData: FormData,
): Promise<AuthResult> {
  const result = await sendPasswordReset(formData);
  if (result?.error) return result;

  const email = String(formData.get("email") ?? "");
  redirect(`/forgot-password/sent?email=${encodeURIComponent(email)}`);
}

/**
 * The same send, without the navigation.
 *
 * The resend button on the confirmation screen is already *on* that screen, and
 * it has bookkeeping to do once the send lands — recording the attempt, arming
 * the cooldown, showing a toast. A `redirect()` throws past all of it.
 */
export async function resendPasswordReset(
  formData: FormData,
): Promise<AuthResult> {
  return sendPasswordReset(formData);
}

/**
 * Finish a password reset.
 *
 * Relies on the recovery session `/auth/confirm` established when the emailed
 * link was verified. `updateUser` is scoped to `auth.uid()`, so there is no way
 * to aim this at another account even with a forged form post.
 */
export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const parsed = passwordSchema.safeParse(formData.get("password"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pick a stronger password" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "That reset link has expired. Request a new one and try again.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  redirect("/dashboard?password=updated");
}
