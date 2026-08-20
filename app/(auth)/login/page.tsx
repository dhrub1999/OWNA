import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "../auth-form";
import { signInWithPassword } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  // AuthForm reads ?next= via useSearchParams, which is request data. With
  // Cache Components on, that has to sit behind a Suspense boundary so the rest
  // of the page can still be prerendered.
  return (
    <Suspense fallback={<div className="h-96" />}>
      <AuthForm mode="signin" action={signInWithPassword} />
    </Suspense>
  );
}
