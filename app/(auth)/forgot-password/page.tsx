import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordReset } from "../actions";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

/**
 * No session read and no query string, so this page stays fully prerendered —
 * unlike `/login` and `/signup`, there is nothing here that depends on who is
 * asking. Someone locked out is quite likely to be on a slow connection on a
 * phone, and this is the one screen in the funnel that can paint instantly.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&rsquo;ll send you a link to set a new one.
        </p>
      </div>

      <ForgotPasswordForm action={requestPasswordReset} />

      <p className="text-muted-foreground text-center text-sm">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
