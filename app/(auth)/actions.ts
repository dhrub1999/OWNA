"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath, signInSchema, signUpSchema } from "@/lib/validations/auth";

/**
 * Email/password auth.
 *
 * Both actions re-validate their input server-side. The matching client schemas
 * exist for inline errors only — a Server Action is a public endpoint and has
 * to assume the form was never rendered.
 */

export type AuthResult = { error: string } | undefined;

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
    // Deliberately not distinguishing "no such user" from "wrong password":
    // the difference tells an attacker which addresses have accounts.
    return { error: "That email and password don't match." };
  }

  redirect(safeNextPath(formData.get("next") as string) ?? "/dashboard");
}

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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: error.message };
  }

  // With email confirmation on, signUp returns a user but no session. Sending
  // them to the editor would just bounce off the proxy.
  if (!data.session) {
    redirect(`/signup/check-email?email=${encodeURIComponent(parsed.data.email)}`);
  }

  redirect("/onboarding/username");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
