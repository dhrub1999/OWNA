import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "../auth-form";
import { signUpWithPassword } from "../actions";

export const metadata: Metadata = { title: "Create your profile" };

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <AuthForm mode="signup" action={signUpWithPassword} />
    </Suspense>
  );
}
